import { useEffect, useMemo, useRef } from "react";
import "./ConjunctionScene.css";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Earth } from "./Earth.tsx";
import { SpaceObjectMarker } from "./SpaceObjectMarker.tsx";
import { TrajectoryPath } from "./TrajectoryPath.tsx";
import { EncounterZone } from "./EncounterZone.tsx";
import { MissDistanceLine } from "./MissDistanceLine.tsx";
import {
  propagateLinear,
  computeGeometry,
  RED_THRESHOLD,
  YELLOW_THRESHOLD,
  type ConjunctionInput,
  type ManeuverRecommendation,
} from "../../lib/index.ts";

type ConjunctionSceneProps = {
  values: ConjunctionInput;
  result:
    | { status: "idle" }
    | { status: "success"; data: ManeuverRecommendation }
    | { status: "error"; error: unknown };
};

const SCALE = 1 / 1000;

function getRiskColor(pc: number): string {
  if (pc > RED_THRESHOLD) return "#ef4444";
  if (pc > YELLOW_THRESHOLD) return "#eab308";
  return "#22c55e";
}

function CameraController({
  target,
  controlsRef,
}: {
  target: [number, number, number];
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const mid = new THREE.Vector3(...target);
    const direction = mid.clone().normalize();
    if (direction.length() === 0) direction.set(0, 0, 1);
    const cameraPos = mid.clone().add(direction.clone().multiplyScalar(6));
    camera.position.copy(cameraPos);
    camera.lookAt(mid);

    if (controlsRef.current) {
      controlsRef.current.target.copy(mid);
      controlsRef.current.update();
    }
  }, [target, camera, controlsRef]);

  return null;
}

function SceneContent({ values, result }: ConjunctionSceneProps) {
  const progressRef = useRef(0);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    progressRef.current = 0;
  }, [values]);

  useFrame((_, delta) => {
    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + delta * 0.2);
    }
  });

  const geometry = useMemo(() => {
    try {
      return computeGeometry(values);
    } catch {
      return null;
    }
  }, [values]);

  const tca = geometry?.timeToClosestApproach ?? 0;
  const hasResult = result.status === "success";
  const riskColor = hasResult
    ? getRiskColor(result.data.risk.collisionProbability)
    : "#22c55e";
  const missDistance = hasResult ? result.data.risk.missDistance : 0;

  // TCA positions
  const primaryAtTCA = useMemo(
    () =>
      propagateLinear(tca)(values.primary.position)(values.primary.velocity),
    [tca, values.primary.position, values.primary.velocity],
  );
  const secondaryAtTCA = useMemo(
    () =>
      propagateLinear(tca)(values.secondary.position)(
        values.secondary.velocity,
      ),
    [tca, values.secondary.position, values.secondary.velocity],
  );

  const primaryTCAScaled: [number, number, number] = [
    primaryAtTCA[0] * SCALE,
    primaryAtTCA[1] * SCALE,
    primaryAtTCA[2] * SCALE,
  ];
  const secondaryTCAScaled: [number, number, number] = [
    secondaryAtTCA[0] * SCALE,
    secondaryAtTCA[1] * SCALE,
    secondaryAtTCA[2] * SCALE,
  ];

  const encounterMidpoint: [number, number, number] = [
    (primaryTCAScaled[0] + secondaryTCAScaled[0]) / 2,
    (primaryTCAScaled[1] + secondaryTCAScaled[1]) / 2,
    (primaryTCAScaled[2] + secondaryTCAScaled[2]) / 2,
  ];

  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} />
      <ambientLight intensity={0.2} />

      <Earth />

      <CameraController target={encounterMidpoint} controlsRef={controlsRef} />

      {/* Primary object */}
      <SpaceObjectMarker
        position={values.primary.position}
        color="#4fc3f7"
        label={values.primary.id || "Primary"}
        labelOffset="above"
        markerScale={1}
      />

      {/* Secondary object */}
      <SpaceObjectMarker
        position={values.secondary.position}
        color="#ff8a65"
        label={values.secondary.id || "Secondary"}
        labelOffset="below"
        markerScale={1}
      />

      {/* Trajectory paths */}
      {geometry && (
        <>
          <TrajectoryPath
            position={values.primary.position}
            velocity={values.primary.velocity}
            tca={tca}
            color="#4fc3f7"
          />
          <TrajectoryPath
            position={values.secondary.position}
            velocity={values.secondary.velocity}
            tca={tca}
            color="#ff8a65"
            dashed
          />
        </>
      )}

      {/* Encounter zone */}
      <EncounterZone
        position={encounterMidpoint}
        color={riskColor}
        visible={hasResult}
      />

      {/* Miss distance line */}
      <MissDistanceLine
        start={primaryTCAScaled}
        end={secondaryTCAScaled}
        distance={missDistance}
        visible={hasResult}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        minDistance={0.5}
        maxDistance={30}
      />
    </>
  );
}

export function ConjunctionScene({ values, result }: ConjunctionSceneProps) {
  return (
    <div className="viewport">
      <Canvas
        camera={{ position: [0, 12, 12], fov: 45, near: 0.001, far: 500 }}
        style={{ width: "100%", height: "100%" }}
      >
        <SceneContent values={values} result={result} />
      </Canvas>
    </div>
  );
}
