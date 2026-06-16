import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import {
  calculateEarthquake,
  getEarthquakeStatus,
  type EarthquakeParams,
} from "@/lib/physics/earthquake"
import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"

const MATERIALS: { value: EarthquakeParams["material"]; label: string }[] = [
  { value: "unreinforced", label: "Beton Biasa (Tanpa Besi Tulangan)" },
  { value: "reinforced", label: "Beton Bertulang (Standar Gedung Modern)" },
  { value: "damped", label: "Rangka Baja & Peredam Goyangan (Teknologi Canggih)" },
]

export function EarthquakeSim() {
  const [floors, setFloors] = useState(10)
  const [material, setMaterial] = useState<EarthquakeParams["material"]>("reinforced")
  const [magnitude, setMagnitude] = useState(6.0)

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const result = useMemo(
    () => calculateEarthquake({ floors, material, magnitude }),
    [floors, material, magnitude]
  )

  const currentAmplitude = result.amplitudeAt(currentTime)
  const currentDeflections = result.deflectionsAt(currentTime)
  const safety = getEarthquakeStatus(currentAmplitude, material)

  // Find peak amplitude across the simulation
  const peakAmplitude = useMemo(() => {
    let peak = 0
    for (let t = 0; t <= 8; t += 0.05) {
      peak = Math.max(peak, Math.abs(result.amplitudeAt(t)))
    }
    return peak
  }, [result])

  const startAnimation = useCallback(() => {
    setIsAnimating(true)
    setCurrentTime(0)
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000
      if (elapsed >= 8) {
        setCurrentTime(8)
        setIsAnimating(false)
        return
      }
      setCurrentTime(elapsed)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  // Canvas drawing
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const W = rect.width
    const H = rect.height

    // Clear
    ctx.clearRect(0, 0, W, H)

    // Drawing parameters
    const padTop = 20
    const padBottom = 30
    const drawH = H - padTop - padBottom
    const centerX = W / 2
    const columnOffset = 25
    const floorH = drawH / floors

    // Ground line
    ctx.strokeStyle = "#92400e"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, H - padBottom)
    ctx.lineTo(W, H - padBottom)
    ctx.stroke()

    // Draw columns and floors
    const leftPts: [number, number][] = []
    const rightPts: [number, number][] = []

    for (let i = 0; i <= floors; i++) {
      const y = H - padBottom - i * floorH
      const normalY = i / floors
      const deflection = currentDeflections[i] ?? 0
      const px = centerX + deflection * 12 // scale for visibility

      leftPts.push([px - columnOffset, y])
      rightPts.push([px + columnOffset, y])
    }

    // Floor slabs (dashed)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (let i = 0; i <= floors; i++) {
      ctx.beginPath()
      ctx.moveTo(leftPts[i][0], leftPts[i][1])
      ctx.lineTo(rightPts[i][0], rightPts[i][1])
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Left column
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 4
    ctx.lineJoin = "round"
    ctx.beginPath()
    leftPts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

    // Right column
    ctx.beginPath()
    rightPts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

    // Dots at joints
    ctx.fillStyle = "#ef4444"
    for (const [x, y] of [...leftPts, ...rightPts]) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Time label
    ctx.fillStyle = "var(--color-text-muted, #64748b)"
    ctx.font = "12px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`t = ${currentTime.toFixed(2)} detik`, centerX, H - 8)
  }, [currentDeflections, currentTime, floors])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
          🏗️ Simulasi Gedung Tahan Gempa
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-2xl leading-relaxed">
          Saat gempa bumi terjadi, tanah akan bergoyang ke samping. Gedung bertingkat harus dirancang
          fleksibel tetapi kokoh agar goyangan tersebut tidak meruntuhkan tiang penopang bangunan.
        </p>
      </div>

      {/* Main content: controls + visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls panel */}
        <div className="space-y-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">
            Pengaturan Bangunan & Gempa
          </h2>

          {/* Floors slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--color-text-muted)]">Tinggi Gedung (Lantai)</label>
              <span className="text-sm font-bold text-civil-600 dark:text-civil-400 tabular-nums">{floors}</span>
            </div>
            <input
              type="range"
              min={3}
              max={20}
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full accent-civil-500"
            />
          </div>

          {/* Material select */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--color-text-muted)]">Bahan Utama Struktur</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as EarthquakeParams["material"])}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-2 focus:outline-civil-500"
            >
              {MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Magnitude slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--color-text-muted)]">Kekuatan Gempa (Richter)</label>
              <span className="text-sm font-bold text-civil-600 dark:text-civil-400 tabular-nums">{magnitude.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={magnitude}
              onChange={(e) => setMagnitude(Number(e.target.value))}
              className="w-full accent-civil-500"
            />
          </div>

          {/* Info box */}
          <div className="rounded-[var(--radius-md)] bg-civil-500/5 border border-civil-500/20 p-3 text-xs text-civil-700 dark:text-civil-300 leading-relaxed space-y-1">
            <p className="font-semibold">💡 Info Sipil untuk Awam:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong>Beton Biasa</strong> sangat rapuh saat ditarik/digoyang ke samping.</li>
              <li><strong>Beton Bertulang</strong> menggunakan besi di dalamnya untuk menahan gaya tarik.</li>
              <li><strong>Peredam Goyangan</strong> bertindak seperti suspensi mobil yang menyerap energi gempa.</li>
            </ul>
          </div>

          {/* Start button */}
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className="w-full py-3 rounded-[var(--radius-lg)] bg-civil-500 text-white font-semibold text-sm transition-all hover:bg-civil-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnimating ? "⏳ Simulasi Berjalan..." : "🚀 MULAI SIMULASI GEMPA"}
          </button>
        </div>

        {/* Visualization panel */}
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricDisplay
              label="Simpangan Saat Ini"
              value={Math.abs(currentAmplitude)}
              unit="m"
              status={safety.status}
            />
            <MetricDisplay
              label="Simpangan Puncak"
              value={peakAmplitude}
              unit="m"
              status={peakAmplitude > 6 ? "danger" : peakAmplitude > 4 ? "warning" : "safe"}
            />
            <MetricDisplay
              label="Rasio Redaman"
              value={(result.damping * 100).toFixed(0) + "%"}
              status="neutral"
            />
          </div>

          {/* Canvas */}
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ height: "400px" }}
            />
          </div>

          {/* Status */}
          <StatusBadge status={safety.status}>
            {safety.message}
          </StatusBadge>
        </div>
      </div>
    </div>
  )
}
