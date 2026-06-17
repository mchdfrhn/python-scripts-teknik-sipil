const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:8000/api/v1");

export interface Metadata {
  STEEL_PROFILES: Record<string, { h: number; tw: number; Ix: number; Zx: number; label: string }>;
  STEEL_MATERIALS: Record<string, { fy: number; label: string }>;
  EARTHQUAKE_SYSTEMS: Record<string, { R: number; Cd: number; damping: number; label: string }>;
  SOIL_TYPES: Record<string, { gamma: number; phi: number; label: string }>;
}

export interface BeamPoint {
  x: number;
  sfd: number;
  bmd: number;
  def: number;
}

export interface SteelBeamResult {
  maxMomen: number;
  maxGeser: number;
  maxDeflection: number;
  phiMn: number;
  phiVn: number;
  limitDeflection: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
  points: BeamPoint[];
}

export interface WindPressurePoint {
  z: number;
  p: number;
}

export interface WindLoadResult {
  pressureList: WindPressurePoint[];
  maxPressure: number;
  alpha: number;
  zg: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
}

export interface ConcreteResult {
  w_c: number;
  finalCement: number;
  flyAshMass: number;
  water: number;
  fineAgg: number;
  coarseAgg: number;
  co2_standard: number;
  co2_eco: number;
  co2_reduction: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
}

export interface TaskDetail {
  name: string;
  start: number;
  end: number;
  dur: number;
  slack: number;
  critical: boolean;
  shortName: string;
}

export interface ScheduleResult {
  totalDuration: number;
  critical_path: string[];
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
  tasks: TaskDetail[];
}

export interface SoilBearingResult {
  q_ult: number;
  q_all: number;
  Nc: number;
  Nq: number;
  Ngamma: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
}

export interface RetainingWallResult {
  Pa: number;
  SF_overturning: number;
  SF_sliding: number;
  q_max: number;
  e_ratio: number;
  baseWidth: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
}

export interface HydrographPoint {
  hour: number;
  discharge: number;
}

export interface HydrologyResult {
  peakDischarge: number;
  totalVolumeM3: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
  hydrograph: HydrographPoint[];
}

export interface PressurePoint {
  distance: number;
  pressure: number;
}

export interface PipeFlowResult {
  headLoss: number;
  finalPressure: number;
  C: number;
  Q: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
  profile: PressurePoint[];
}

export interface CarDetail {
  id: number;
  speed: number;
  lane: number;
}

export interface TrafficResult {
  capacity: number;
  ds: number;
  los: string;
  C0: number;
  FCsf: number;
  status: "safe" | "warning" | "danger" | "neutral";
  msg: string;
  cars: CarDetail[];
}

export interface EarthquakeResult {
  damping: number;
  stiffness: number;
  materialLabel: string;
  baseShear: number;
  maxDrift: number;
  allowableDrift: number;
  R: number;
  Cd: number;
  Sds: number;
  status: "safe" | "warning" | "danger" | "neutral";
  message: string;
  deflections: number[];
}

// Global fetch helpers
async function getData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

async function postData<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getMetadata: () => getData<Metadata>("/meta"),

  calculateSteelBeam: (params: { length: number; load: number; profileType: string; material: string }) =>
    postData<SteelBeamResult>("/steel-beam", params),

  calculateWindLoad: (params: { windSpeed: number; buildingHeight: number; exposure: string }) =>
    postData<WindLoadResult>("/wind-load", params),

  calculateConcrete: (params: { targetStrength: number; flyAshPercent: number }) =>
    postData<ConcreteResult>("/concrete", params),

  calculateScheduling: (params: { A: number; B: number; C: number; D: number; E: number; F: number }) =>
    postData<ScheduleResult>("/scheduling", params),

  calculateSoilBearing: (params: { width: number; cohesion: number; phi: number }) =>
    postData<SoilBearingResult>("/soil-bearing", params),

  calculateRetainingWall: (params: { height: number; soilType: string }) =>
    postData<RetainingWallResult>("/retaining-wall", params),

  calculateHydrology: (params: { rainIntensity: number; area: number; runoffCoef: number }) =>
    postData<HydrologyResult>("/hydrology", params),

  calculatePipeFlow: (params: { length: number; diameterMm: number }) =>
    postData<PipeFlowResult>("/pipe-flow", params),

  calculateTraffic: (params: { volume: number; lanes: number }) =>
    postData<TrafficResult>("/traffic", params),

  calculateEarthquake: (params: { floors: number; material: string; magnitude: number }) =>
    postData<EarthquakeResult>("/earthquake", params),
};
