/**
 * Earthquake physics engine — Damped harmonic oscillation model.
 * Ported from earthquake.py
 */

export interface EarthquakeParams {
  floors: number
  material: "unreinforced" | "reinforced" | "damped"
  magnitude: number
}

export interface EarthquakeResult {
  damping: number
  stiffness: number
  materialLabel: string
  /** Get amplitude at time t (seconds) */
  amplitudeAt: (t: number) => number
  /** Get floor deflections at time t */
  deflectionsAt: (t: number) => number[]
}

const MATERIAL_CONFIG = {
  unreinforced: { damping: 0.02, stiffness: 15.0, label: "Beton Biasa (Tanpa Besi Tulangan)" },
  reinforced:   { damping: 0.07, stiffness: 10.0, label: "Beton Bertulang (Standar Gedung Modern)" },
  damped:       { damping: 0.25, stiffness: 5.0,  label: "Rangka Baja & Peredam Goyangan" },
}

export function calculateEarthquake(params: EarthquakeParams): EarthquakeResult {
  const config = MATERIAL_CONFIG[params.material]

  const amplitudeAt = (t: number): number => {
    return (
      params.magnitude *
      (config.stiffness / 10) *
      Math.exp(-config.damping * t) *
      Math.sin(2 * Math.PI * 0.5 * t)
    )
  }

  const deflectionsAt = (t: number): number[] => {
    const amp = amplitudeAt(t)
    const floors = params.floors
    const yCoords: number[] = []
    for (let i = 0; i <= floors; i++) {
      const y = i / floors // normalized 0..1
      const deflection = amp * Math.pow(y, 2)
      yCoords.push(deflection)
    }
    return yCoords
  }

  return {
    damping: config.damping,
    stiffness: config.stiffness,
    materialLabel: config.label,
    amplitudeAt,
    deflectionsAt,
  }
}

/**
 * Get safety status based on amplitude and material.
 */
export function getEarthquakeStatus(
  amplitude: number,
  material: EarthquakeParams["material"]
): { status: "safe" | "warning" | "danger"; message: string } {
  const absAmp = Math.abs(amplitude)

  if (absAmp > 6.0 && material === "unreinforced") {
    return {
      status: "danger",
      message: `BAHAYA BESAR: Gedung runtuh total! Beton biasa langsung pecah karena tidak mampu menahan gaya tarik saat bergoyang (Simpangan = ${absAmp.toFixed(2)}m).`,
    }
  }
  if (absAmp > 4.0) {
    return {
      status: "warning",
      message: `KERUSAKAN STRUKTUR: Tiang beton mengalami retak parah (Simpangan = ${absAmp.toFixed(2)}m). Gedung masih berdiri namun tidak aman dihuni.`,
    }
  }
  return {
    status: "safe",
    message: `GEDUNG AMAN: Struktur bergoyang secara aman dan getaran diredam dengan cepat (Simpangan = ${absAmp.toFixed(2)}m).`,
  }
}
