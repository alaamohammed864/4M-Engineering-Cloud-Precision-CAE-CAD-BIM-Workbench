export type ActiveWorkbenchView =
  | 'workbench'
  | 'geometry-and-sketch'
  | 'physics-definition'
  | 'mesh-generator'
  | 'solver-monitor'
  | 'results-and-reports'
  | 'fea-acceptance'
  | 'mep-bim'
  | 'system-settings';

export type UserExperienceMode = 'beginner' | 'advanced';
export type AppLanguage = 'en' | 'ar';

export interface ValidationMessage {
  level: 'ERROR' | 'WARNING' | 'INFO';
  problem: string;
  location: string;
  reason: string;
  solution: string;
}

export interface FeaCalculationResult {
  solver: string;
  resultType: string;
  modelType: string;
  material: {
    name: string;
    youngsModulusGpa: number;
    yieldStrengthMpa: number;
    poissonRatio: number;
  };
  dimensions: {
    lengthM: number;
    widthMm: number;
    heightMm: number;
    momentOfInertiaM4: number;
    sectionModulusM3: number;
  };
  loads: {
    tipForceY: number;
  };
  reactions: {
    reactionForceY: number;
    reactionMomentZ: number;
    equilibriumCheck: string;
  };
  results: {
    maxVonMisesStressMpa: number;
    tipDisplacementMm: number;
    safetyFactor: number;
    status: 'STRUCTURALLY_SAFE' | 'YIELD_EXCEEDED_WARNING';
  };
  distribution: Array<{
    station: number;
    xRatio: number;
    xMeters: number;
    momentNm: number;
    vonMisesStressMpa: number;
    displacementMm: number;
  }>;
  provenanceHash: string;
  timestamp: string;
}

export interface CfdCalculationResult {
  solver: string;
  resultType: string;
  flowRegime: string;
  fluid: {
    name: string;
    densityKgM3: number;
    dynamicViscosityPaS: number;
  };
  pipeDimensions: {
    diameterMm: number;
    lengthM: number;
    roughnessMm: number;
  };
  aerodynamicsHydraulics: {
    reynoldsNumber: number;
    frictionFactor: number;
    flowRateM3H: number;
    massFlowKgS: number;
    pressureDropPa: number;
    pressureDropBar: number;
    wallShearStressPa: number;
    firstCellHeightForYplus1Mm: number;
  };
  velocityProfile: Array<{
    rRatio: number;
    rMm: number;
    velocityMs: number;
  }>;
  provenanceHash: string;
  timestamp: string;
}

export type SolverStatus = 'idle' | 'running' | 'paused' | 'converged';

export interface ModelTreeNode {
  id: string;
  name: string;
  type: 'assembly' | 'solid' | 'face' | 'boundary' | 'mesh' | 'feature';
  visible: boolean;
  expanded?: boolean;
  children?: ModelTreeNode[];
  meta?: string;
}

export interface PersistentSelection {
  id: string;
  name: string;
  faceIds: string[];
  type: 'Velocity Inlet' | 'Pressure Outlet' | 'No-slip Wall' | 'Symmetry';
  value: string;
  uuid: string;
  color: string;
}

export interface SketchEntity {
  id: string;
  name: string;
  type: 'line' | 'arc' | 'spline' | 'circle';
  lengthOrParam: string;
  color: string;
}

export interface ConstraintItem {
  id: string;
  name: string;
  code: string;
  type: 'Coincident' | 'Tangent' | 'Horizontal' | 'Perpendicular' | 'Equal' | 'Symmetric' | 'Fixed';
}

export interface DimensionParameter {
  name: string;
  value: number;
  unit: string;
  tolerance: string;
  exposeToDoe: boolean;
}

export interface MeshDiagnostics {
  totalElements: number;
  totalNodes: number;
  hexRatio: number;
  tetraRatio: number;
  minOrthoQuality: number;
  maxAspectRatio: number;
  maxNonOrtho: number;
  maxSkewness: number;
}

export interface SolverResidualData {
  iteration: number;
  ux: number;
  uy: number;
  p: number;
  omega: number;
  continuityError: number;
  courantNumber: number;
  cl: number;
  cd: number;
  cm: number;
}

export interface ForceIntegrals {
  fy: number; // Lift
  fx: number; // Drag
  ldRatio: number;
  alpha: number; // Angle of attack
  pressureRatio: number;
}

export interface BoqItem {
  id: string;
  item: string;
  category: 'Structural' | 'HVAC' | 'Electrical' | 'Plumbing' | 'Fire Protection';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface AiCopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  module?: string;
  source?: string;
}
