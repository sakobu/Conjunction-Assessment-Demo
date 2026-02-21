/*
  Demo module for conjunction-risk style calculations using @railway-ts/pipelines.
  This is primarily a teaching and experimentation example for pipeline patterns,
  schema validation, and Result/Option flows, not a production collision-avoidance model.
*/

import { flow, curry } from "@railway-ts/pipelines/composition";
import {
  fromNullable,
  none,
  combine as combineOptions,
  some,
  match as matchOption,
  mapWith as optMapWith,
  unwrapOr,
  type Option,
} from "@railway-ts/pipelines/option";
import {
  err,
  flatMapWith,
  mapWith,
  mapErrWith,
  ok,
  tapErrWith,
  type Result,
} from "@railway-ts/pipelines/result";
import {
  validate,
  object,
  required,
  optional,
  chain,
  number,
  string,
  min,
  max,
  finite,
  refineAt,
  nonEmpty,
  transform,
  stringEnum,
  tupleOf,
  formatErrors,
  type InferSchemaType,
  type ValidationError,
} from "@railway-ts/pipelines/schema";

// --- Constants ------------------------------------------------

const HARD_BODY_RADIUS = 0.01; // km - 10m combined hard-body radius
export const RED_THRESHOLD = 1e-4; // Pc > 1e-4 -> maneuver
export const YELLOW_THRESHOLD = 1e-5; // Pc > 1e-5 -> monitor
const MISS_DISTANCE_SCREEN = 1.0; // km - hard-body screening threshold
const MIN_RELATIVE_VELOCITY_FOR_TCA = 1e-6; // km/s - lower bound for stable TCA estimation
const ENABLE_DEBUG_PIPELINE_ERRORS = false;

// --- Types ----------------------------------------------------

export type Vec3 = [number, number, number];

export type SpaceObject = InferSchemaType<typeof spaceObjectSchema>;

export type ConjunctionGeometry = {
  primary: SpaceObject;
  secondary: SpaceObject;
  missDistance: number;
  relativeVelocity: number;
  timeToClosestApproach: number;
  radialSeparation: number;
};

export type CollisionRisk = ConjunctionGeometry & {
  collisionProbability: number;
  combinedCovariance: Option<Vec3>;
  hardBodyRadius: number;
};

export type ManeuverRecommendation = {
  action: "no_action" | "monitor" | "maneuver";
  risk: CollisionRisk;
  deltaVRequired: Option<number>;
  reasoning: string;
};

export type AssessError =
  | { kind: "validation"; errors: Record<string, string> }
  | { kind: "domain"; message: string };

// --- Schemas --------------------------------------------------

const positionSchema = tupleOf(
  chain(number(), finite(), min(-50_000), max(50_000)),
  3,
);
const velocitySchema = tupleOf(chain(number(), finite(), min(-15), max(15)), 3);
const covarianceSchema = tupleOf(
  chain(number(), finite(), min(0), max(100)),
  3,
);

const spaceObjectSchema = object({
  id: required(
    chain(
      string(),
      nonEmpty("Object ID cannot be empty"),
      transform((s: string) => s.trim()),
    ),
  ),
  objectType: required(
    stringEnum(["payload", "debris", "rocket_body"] as const),
  ),
  position: required(positionSchema),
  velocity: required(velocitySchema),
  covariance: optional(covarianceSchema),
});

export const conjunctionInputSchema = chain(
  object({
    primary: required(spaceObjectSchema),
    secondary: required(spaceObjectSchema),
  }),
  refineAt(
    "secondary.id",
    (input) => input.primary.id !== input.secondary.id,
    "Primary and secondary must be different objects",
  ),
);

export type ConjunctionInput = InferSchemaType<typeof conjunctionInputSchema>;

// --- Pure Vector Math ----------------------------------------

const vec3Sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
const vec3Dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vec3Mag = (v: Vec3): number => Math.sqrt(vec3Dot(v, v));
const vec3Scale = curry(
  (s: number, v: Vec3): Vec3 => [v[0] * s, v[1] * s, v[2] * s],
);

// --- Conjunction Geometry ------------------------------------

const timeToClosestApproach = (relPos: Vec3, relVel: Vec3): number => {
  const vSquared = vec3Dot(relVel, relVel);
  if (vSquared < 1e-12) return 0;
  return Math.max(0, -vec3Dot(relPos, relVel) / vSquared);
};

export const propagateLinear = curry(
  (dt: number, pos: Vec3, vel: Vec3): Vec3 => [
    pos[0] + vel[0] * dt,
    pos[1] + vel[1] * dt,
    pos[2] + vel[2] * dt,
  ],
);

export const computeGeometry = (input: ConjunctionInput): ConjunctionGeometry => {
  const relPos = vec3Sub(input.secondary.position, input.primary.position);
  const relVel = vec3Sub(input.secondary.velocity, input.primary.velocity);
  const tca = timeToClosestApproach(relPos, relVel);

  const primaryAtTCA = propagateLinear(tca)(input.primary.position)(
    input.primary.velocity,
  );
  const secondaryAtTCA = propagateLinear(tca)(input.secondary.position)(
    input.secondary.velocity,
  );
  const separationAtTCA = vec3Sub(secondaryAtTCA, primaryAtTCA);

  const primaryMag = vec3Mag(primaryAtTCA);
  const radialSep =
    primaryMag > 1e-12
      ? vec3Dot(separationAtTCA, vec3Scale(1 / primaryMag)(primaryAtTCA))
      : 0;

  return {
    primary: input.primary,
    secondary: input.secondary,
    missDistance: vec3Mag(separationAtTCA),
    relativeVelocity: vec3Mag(relVel),
    timeToClosestApproach: tca,
    radialSeparation: radialSep,
  };
};

// --- Collision Probability -----------------------------------

const rssCov = (a: Vec3, b: Vec3): Vec3 => [
  Math.hypot(a[0], b[0]),
  Math.hypot(a[1], b[1]),
  Math.hypot(a[2], b[2]),
];

const combineCovariance = (a: Option<Vec3>, b: Option<Vec3>): Option<Vec3> =>
  matchOption(combineOptions([a, b]), {
    some: ([covA, covB]) => some(rssCov(covA, covB)),
    none: () => matchOption(a, { some: () => a, none: () => b }),
  });

const extractSigma = (combinedSigma: Option<Vec3>): number => {
  const mapped = optMapWith((cov: Vec3) => Math.hypot(cov[0], cov[1]))(
    combinedSigma,
  );
  return unwrapOr(mapped, 0.05); // default 50m uncertainty
};

// Simplified Chan's method - 2D Gaussian in the encounter plane
const gaussianCollisionProbability = (
  missDistance: number,
  hardBody: number,
  combinedSigma: Option<Vec3>,
): number => {
  const sigma = extractSigma(combinedSigma);
  if (sigma < 1e-12) return missDistance < hardBody ? 1.0 : 0.0;
  const sigmaSquared = 2 * sigma ** 2;
  return Math.min(
    1,
    (hardBody ** 2 / sigmaSquared) *
      Math.exp(-(missDistance ** 2) / sigmaSquared),
  );
};

const assessRisk = (geometry: ConjunctionGeometry): CollisionRisk => {
  const combinedCov = combineCovariance(
    fromNullable(geometry.primary.covariance),
    fromNullable(geometry.secondary.covariance),
  );

  return {
    ...geometry,
    collisionProbability: gaussianCollisionProbability(
      geometry.missDistance,
      HARD_BODY_RADIUS,
      combinedCov,
    ),
    combinedCovariance: combinedCov,
    hardBodyRadius: HARD_BODY_RADIUS,
  };
};

const validateGeometryForRiskModel = (
  geometry: ConjunctionGeometry,
): Result<ConjunctionGeometry, string> => {
  if (geometry.relativeVelocity < MIN_RELATIVE_VELOCITY_FOR_TCA) {
    return err("Relative velocity too low for stable TCA risk estimation");
  }
  return ok(geometry);
};

// --- Maneuver Recommendation ---------------------------------

// dV ~= targetMiss / warningTime - along-track impulse produces miss ~= dV * dT
const MIN_WARNING_TIME = 3600; // 1 hour - minimum assumed warning before TCA

const estimateDeltaV = (targetMiss: number, tca: number): number =>
  targetMiss / Math.max(tca, MIN_WARNING_TIME);

type Rule = {
  action: ManeuverRecommendation["action"];
  test: (pc: number, miss: number) => boolean;
  reasoning: (pc: number, miss: number) => string;
  deltaV: (miss: number, tca: number) => Option<number>;
};

const noneDv = () => none<number>();

const rules: Rule[] = [
  {
    action: "maneuver",
    test: (pc) => pc > RED_THRESHOLD,
    reasoning: (pc) =>
      `Pc = ${pc.toExponential(2)} exceeds red threshold (${RED_THRESHOLD.toExponential(0)})`,
    deltaV: (miss, tca) => some(estimateDeltaV(Math.max(5.0 - miss, 1.0), tca)),
  },
  {
    action: "monitor",
    test: (pc, miss) => pc > YELLOW_THRESHOLD || miss < MISS_DISTANCE_SCREEN,
    reasoning: (pc, miss) =>
      miss < MISS_DISTANCE_SCREEN
        ? `Miss distance ${miss.toFixed(3)} km below ${MISS_DISTANCE_SCREEN} km screen - refine tracking`
        : `Pc = ${pc.toExponential(2)} in yellow zone - refine with updated tracking`,
    deltaV: noneDv,
  },
];

const defaultRule: Rule = {
  action: "no_action",
  test: () => true,
  reasoning: (pc) =>
    `Pc = ${pc.toExponential(2)} below yellow threshold - no action required`,
  deltaV: noneDv,
};

const recommend = (risk: CollisionRisk): ManeuverRecommendation => {
  const {
    collisionProbability: pc,
    missDistance: miss,
    timeToClosestApproach: tca,
  } = risk;
  const rule = rules.find((r) => r.test(pc, miss)) ?? defaultRule;

  return {
    action: rule.action,
    risk,
    deltaVRequired: rule.deltaV(miss, tca),
    reasoning: rule.reasoning(pc, miss),
  };
};

const normalizeAssessError = (
  error: ValidationError[] | string,
): AssessError =>
  typeof error === "string"
    ? { kind: "domain", message: error }
    : { kind: "validation", errors: formatErrors(error) };

// --- Main Pipeline -------------------------------------------

const validateAndComputeGeometry = flow(
  (input: unknown) => validate(input, conjunctionInputSchema),
  mapWith(computeGeometry),
  flatMapWith(validateGeometryForRiskModel),
);

const assessAndRecommend = flow(mapWith(assessRisk), mapWith(recommend));

export const assessConjunction = flow(
  validateAndComputeGeometry,
  assessAndRecommend,
  mapErrWith(normalizeAssessError),
  tapErrWith((error: AssessError) => {
    if (ENABLE_DEBUG_PIPELINE_ERRORS) {
      console.error("Assessment pipeline error:", error);
    }
  }),
);

// --- Formatting ----------------------------------------------

export const formatRecommendation = (rec: ManeuverRecommendation): string => {
  const dvMapped = optMapWith((v: number) => `${(v * 1000).toFixed(2)} m/s`)(
    rec.deltaVRequired,
  );
  const dv = unwrapOr(dvMapped, "N/A");

  const cov = matchOption(rec.risk.combinedCovariance, {
    some: (c: Vec3) =>
      `[${c.map((v: number) => `${(v * 1000).toFixed(1)}m`).join(", ")}]`,
    none: () => "unavailable (using default 50m)",
  });

  return [
    `Primary:    ${rec.risk.primary.id}`,
    `Secondary:  ${rec.risk.secondary.id}`,
    `Miss Distance:     ${rec.risk.missDistance.toFixed(4)} km`,
    `Relative Velocity: ${rec.risk.relativeVelocity.toFixed(4)} km/s`,
    `Time to TCA:       ${rec.risk.timeToClosestApproach.toFixed(1)} s`,
    `Radial Separation: ${rec.risk.radialSeparation.toFixed(4)} km`,
    `Combined 1sigma:   ${cov}`,
    `Collision Prob:    ${rec.risk.collisionProbability.toExponential(3)}`,
    `Action:            ${rec.action.toUpperCase()}`,
    `dV Required:       ${dv}`,
    `Reasoning:         ${rec.reasoning}`,
  ].join("\n");
};

// --- Scenarios ------------------------------------------------

export type Scenario = {
  label: string;
  input: ConjunctionInput;
};

export const scenarios: Scenario[] = [
  {
    label: "Scenario 1: Close LEO Conjunction (RED - maneuver)",
    input: {
      primary: {
        id: "ISS (ZARYA)",
        objectType: "payload",
        position: [6778, 0, 0],
        velocity: [0, 7.66, 0],
        covariance: [0.05, 0.1, 0.03],
      },
      secondary: {
        id: "COSMOS 2251 DEB",
        objectType: "debris",
        position: [6778.002, 0.001, 0.0005],
        velocity: [0.01, -7.5, 0.2],
        covariance: [0.2, 0.5, 0.15],
      },
    },
  },
  {
    label: "Scenario 2: Safe Pass - No Covariance (GREEN - no action)",
    input: {
      primary: {
        id: "SENTINEL-6A",
        objectType: "payload",
        position: [7714, 0, 0],
        velocity: [0, 7.2, 0],
      },
      secondary: {
        id: "SL-16 R/B",
        objectType: "rocket_body",
        position: [7714, 5.0, 2.0],
        velocity: [0.1, -7.0, 0.3],
      },
    },
  },
  {
    label: "Scenario 3: Yellow Zone - Monitor",
    input: {
      primary: {
        id: "STARLINK-1234",
        objectType: "payload",
        position: [6928, 0, 0],
        velocity: [0, 7.58, 0],
        covariance: [0.08, 0.15, 0.05],
      },
      secondary: {
        id: "FENGYUN 1C DEB",
        objectType: "debris",
        position: [6929.2, 0.6, 0.2],
        velocity: [0.02, 7.4, 0.3],
        covariance: [0.3, 0.8, 0.2],
      },
    },
  },
  {
    label: "Scenario 4: Validation Error - Same Object",
    input: {
      primary: {
        id: "ISS",
        objectType: "payload",
        position: [6778, 0, 0],
        velocity: [0, 7.66, 0],
      },
      secondary: {
        id: "ISS",
        objectType: "payload",
        position: [6800, 0, 0],
        velocity: [0, 7.6, 0],
      },
    },
  },
  {
    label: "Scenario 5: Validation Error - Superluminal Debris",
    input: {
      primary: {
        id: "HUBBLE",
        objectType: "payload",
        position: [6948, 0, 0],
        velocity: [0, 7.5, 0],
      },
      secondary: {
        id: "MAGIC DEBRIS",
        objectType: "debris",
        position: [6950, 0, 0],
        velocity: [0, 999, 0],
      },
    },
  },
  {
    label: "Scenario 6: Domain Error - Near-Zero Relative Velocity",
    input: {
      primary: {
        id: "CALM-SAT-1",
        objectType: "payload",
        position: [7000, 0, 0],
        velocity: [0, 7.5, 0],
        covariance: [0.05, 0.05, 0.05],
      },
      secondary: {
        id: "CALM-SAT-2",
        objectType: "payload",
        position: [7000.5, 0.5, 0.2],
        velocity: [0, 7.500_000_000_1, 0],
        covariance: [0.05, 0.05, 0.05],
      },
    },
  },
];


