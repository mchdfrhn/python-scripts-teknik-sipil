/**
 * Earthquake physics engine — Real Case (SNI 1726:2019)
 */

export interface EarthquakeParams {
  floors: number
  material: "SRPMK" | "SRPMM" | "SRPMB"
  magnitude: number // Repurposed as SDS (Spectral Acceleration) multiplier (1 to 10 mapped to 0.1g to 1.5g)
}

export interface EarthquakeResult {
  damping: number
  stiffness: number
  materialLabel: string
  baseShear: number
  maxDrift: number
  allowableDrift: number
  /** Get amplitude at time t (seconds) */
  amplitudeAt: (t: number) => number
  /** Get floor deflections at time t */
  deflectionsAt: (t: number) => number[]
}

const MATERIAL_CONFIG = {
  SRPMB: { R: 3.0, Cd: 2.5, damping: 0.05, label: "Rangka Beton Biasa (SRPMB, R=3)" },
  SRPMM: { R: 5.0, Cd: 4.5, damping: 0.05, label: "Rangka Beton Menengah (SRPMM, R=5)" },
  SRPMK: { R: 8.0, Cd: 5.5, damping: 0.05, label: "Rangka Beton Khusus (SRPMK, R=8)" },
}

export function calculateEarthquake(params: EarthquakeParams): EarthquakeResult {
  const config = MATERIAL_CONFIG[params.material]

  // SNI 1726 Parameters
  const Sds = (params.magnitude / 10) * 1.5; // Scale 1-10 to 0.15g - 1.5g
  const Ie = 1.0; // Faktor Keutamaan
  const R = config.R;
  const Cd = config.Cd;
  
  // Approximate building properties
  const floorHeight = 4.0; // 4 meters per floor
  const hn = params.floors * floorHeight;
  const W = params.floors * 2500; // Assume 2500 kN weight per floor
  
  // Seismic Base Shear (V = Cs * W)
  let Cs = Sds / (R / Ie);
  if (Cs < 0.044 * Sds * Ie) Cs = 0.044 * Sds * Ie; // SNI minimum
  const V = Cs * W; // kN

  // Approximate Roof Drift (elastic) -> very simplified structural mechanics for cantilever
  // Delta_e = V * hn^3 / (3 * E * I_eq)
  // We'll calibrate an arbitrary stiffness so that drift is somewhat realistic (e.g. 1-5% of height)
  // Let's just use an empirical mapping to get Delta_elastic based on Cs
  const Delta_elastic = (Cs * hn) / 20.0; // rough empirical elastic drift in meters
  
  // Design Inelastic Drift (SNI 1726)
  const maxDrift = (Cd * Delta_elastic) / Ie; // meters
  
  // Allowable Drift (SNI 1726)
  const allowableDrift = 0.020 * hn;

  // For animation: damped harmonic oscillation, starting at 0, max reaching maxDrift
  // Period T = 0.0466 * hn^0.9
  const T = 0.0466 * Math.pow(hn, 0.9);
  const freq = 1 / T;
  
  const amplitudeAt = (t: number): number => {
    // scale to maxDrift, with damping envelope
    return maxDrift * Math.exp(-config.damping * 2 * t) * Math.sin(2 * Math.PI * freq * t);
  }

  const deflectionsAt = (t: number): number[] => {
    const amp = amplitudeAt(t);
    const floors = params.floors;
    const yCoords: number[] = [];
    for (let i = 0; i <= floors; i++) {
      const y = i / floors; // normalized 0..1
      const deflection = amp * Math.pow(y, 1.5); // 1.5 power for shear building mode shape
      yCoords.push(deflection);
    }
    return yCoords;
  }

  return {
    damping: config.damping,
    stiffness: 10, // arbitrary visual param
    materialLabel: config.label,
    baseShear: V,
    maxDrift,
    allowableDrift,
    amplitudeAt,
    deflectionsAt,
  }
}

/**
 * Get safety status based on SNI 1726 drift limits.
 */
export function getEarthquakeStatus(
  maxDrift: number,
  allowableDrift: number,
  material: string
): { status: "safe" | "warning" | "danger"; message: string } {
  
  if (maxDrift > allowableDrift * 1.5) {
    return {
      status: "danger",
      message: `BAHAYA RUNTUH (SNI 1726): Simpangan Atap (${maxDrift.toFixed(2)}m) jauh melebihi batas izin (${allowableDrift.toFixed(2)}m). Kolom beton berisiko patah geser! Gunakan sistem SRPMK atau Dinding Geser.`,
    }
  }
  if (maxDrift > allowableDrift) {
    return {
      status: "warning",
      message: `TIDAK MEMENUHI SYARAT: Simpangan Atap (${maxDrift.toFixed(2)}m) melewati batas izin SNI (${allowableDrift.toFixed(2)}m). Kerusakan non-struktural (dinding bata) akan sangat parah.`,
    }
  }
  return {
    status: "safe",
    message: `MEMENUHI SNI 1726: Simpangan Atap (${maxDrift.toFixed(2)}m) masih di bawah batas aman izin (${allowableDrift.toFixed(2)}m). Struktur dirancang daktail.`,
  }
}
