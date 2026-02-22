# Conjunction Assessment Dashboard

A real-time space conjunction risk assessment tool that evaluates collision probability between orbiting objects and recommends maneuver actions. Built with React, Three.js, and functional programming patterns via [@railway-ts/pipelines](https://www.npmjs.com/package/@railway-ts/pipelines) and [@railway-ts/use-form](https://www.npmjs.com/package/@railway-ts/use-form).

## Overview

The dashboard accepts orbital state vectors (position, velocity, optional covariance) for two space objects, computes their closest approach geometry, estimates collision probability using a simplified Chan's method, and produces a maneuver recommendation with human-readable reasoning.

A 3D scene renders the encounter in real time as inputs change — trajectories, miss distance, and an animated encounter zone all update live before the formal assessment is submitted.

## Architecture

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root component
├── index.css                         # Global styles and CSS variables
├── lib/
│   └── index.ts                      # Domain logic pipeline
├── hooks/
│   └── useConjunctionAssessment.ts   # State management + pipeline bridge
└── components/
    ├── Dashboard/                    # Top-level three-column layout
    ├── InputPanel/                   # Form: scenario selector + object fields
    ├── ResultsPanel/                 # Risk badge, metric grid, error display
    └── Viz/                          # 3D scene: Earth, trajectories, encounter
```

### Data Flow

```
User input → schema validation → live 3D preview
                                       ↓
              "Assess" button → assessConjunction pipeline
                                       ↓
                                validate → geometry → risk → recommend
                                       ↓
                              ResultsPanel + EncounterZone overlay
```

## Domain Logic

The core pipeline in `src/lib/index.ts` composes pure functions via `flow` over `Result`/`Option` types:

1. **Validate** — Schema-checks both space objects (bounds, required fields, duplicate IDs)
2. **Geometry** — Computes time to closest approach (TCA), miss distance, relative velocity via linear propagation
3. **Risk** — Combines covariance (RSS), computes collision probability (Pc) using a 2D Gaussian encounter-plane model
4. **Recommend** — Classifies into `maneuver` / `monitor` / `no_action` based on Pc thresholds and miss distance screening

Key thresholds:
- **Red** (maneuver): Pc > 1e-4
- **Yellow** (monitor): Pc > 1e-5 or miss distance < 1 km
- **Green** (no action): below both

## 3D Visualization

The scene (React Three Fiber + Drei) renders:

- **Earth** — Wireframe sphere at correct scale (6,371 km radius)
- **Trajectory paths** — 100-point linear propagation, +/-300s around TCA
- **Object markers** — Color-coded (cyan primary, orange secondary) with labels
- **Encounter zone** — Pulsing sphere at the midpoint, color-coded by risk
- **Miss distance line** — Dashed connector with km label at TCA

All geometry updates live as form values change, before assessment is submitted.

## Predefined Scenarios

Six built-in scenarios plus two validation test cases:

| Scenario | Description |
|---|---|
| ISS vs Cosmos Debris | Close approach with covariance — high risk |
| Sentinel-6A Flyby | 5 km separation, no covariance — low risk |
| Starlink vs Fengyun Debris | Similar orbit with covariance |
| Duplicate Object ID | Validation error: same ID for both objects |
| Invalid Velocity | Validation error: exceeds 15 km/s bound |
| Co-orbital | Domain error: relative velocity too low for stable TCA |

## Tech Stack

| Dependency | Role |
|---|---|
| React 19 | UI rendering |
| TypeScript 5.9 | Strict type safety |
| Vite 7 | Dev server + bundler |
| @railway-ts/pipelines | Result/Option types, schema validation, functional composition |
| @railway-ts/use-form | Form state management with schema-driven validation |
| Three.js | 3D graphics |
| @react-three/fiber | React renderer for Three.js |
| @react-three/drei | Stars, OrbitControls, Billboard, Text, Line, Html |

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then bundle with Vite |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |
