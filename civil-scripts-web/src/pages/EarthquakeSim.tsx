import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import {
  calculateEarthquake,
  getEarthquakeStatus,
  type EarthquakeParams,
} from "@/lib/physics/earthquake"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Square, Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const MATERIALS: { value: EarthquakeParams["material"]; label: string; desc: string }[] = [
  { value: "SRPMB", label: "Sistem Rangka Pemikul Momen Biasa (R=3)", desc: "Sistem struktur beton standar. Kurang daktail (kaku) menghadapi gempa besar." },
  { value: "SRPMM", label: "Sistem Rangka Pemikul Momen Menengah (R=5)", desc: "Sistem struktur dengan tingkat daktilitas menengah." },
  { value: "SRPMK", label: "Sistem Rangka Pemikul Momen Khusus (R=8)", desc: "Sistem struktur sangat daktail. Wajib untuk daerah zona gempa kuat menurut SNI 1726." },
]

export function EarthquakeSim() {
  const [floors, setFloors] = useState(10)
  const [material, setMaterial] = useState<EarthquakeParams["material"]>("SRPMK")
  const [magnitude, setMagnitude] = useState(6.0) // This maps to SDS 0.1g - 1.5g

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
  const safety = getEarthquakeStatus(result.maxDrift, result.allowableDrift, material)

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

  const stopAnimation = useCallback(() => {
    setIsAnimating(false)
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

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

    ctx.clearRect(0, 0, W, H)

    // Blueprint grid background
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"
    ctx.lineWidth = 1
    const gridSize = 40
    for(let x = 0; x <= W; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for(let y = 0; y <= H; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    const padTop = 40
    const padBottom = 60
    const drawH = H - padTop - padBottom
    const centerX = W / 2
    const columnOffset = 35
    const floorH = drawH / floors

    // Ground line with shadow
    ctx.strokeStyle = "var(--color-border)"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, H - padBottom)
    ctx.lineTo(W, H - padBottom)
    ctx.stroke()
    
    // Hatching under ground
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"
    ctx.lineWidth = 1
    for(let x = -H; x < W; x += 10) {
      ctx.beginPath()
      ctx.moveTo(x, H - padBottom + 5)
      ctx.lineTo(x + padBottom, H)
      ctx.stroke()
    }

    const leftPts: [number, number][] = []
    const rightPts: [number, number][] = []

    for (let i = 0; i <= floors; i++) {
      const y = H - padBottom - i * floorH
      const deflection = currentDeflections[i] ?? 0
      const px = centerX + deflection * 15 // CAD scale factor

      leftPts.push([px - columnOffset, y])
      rightPts.push([px + columnOffset, y])
    }

    // Floor slabs (modern solid)
    ctx.strokeStyle = "var(--color-muted-foreground)"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    for (let i = 0; i <= floors; i++) {
      ctx.beginPath()
      ctx.moveTo(leftPts[i][0] - 10, leftPts[i][1])
      ctx.lineTo(rightPts[i][0] + 10, rightPts[i][1])
      ctx.stroke()
    }

    // Columns
    const isDanger = safety.status === "danger"
    ctx.strokeStyle = isDanger ? "var(--color-destructive)" : "var(--color-civil-500)"
    ctx.lineWidth = 6
    ctx.lineJoin = "round"
    
    // Glow effect if animating and safe
    if (isAnimating && !isDanger) {
      ctx.shadowColor = "rgba(37, 99, 235, 0.4)"
      ctx.shadowBlur = 10
    }

    ctx.beginPath()
    leftPts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

    ctx.beginPath()
    rightPts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

    ctx.shadowBlur = 0 // reset

    // Joint nodes
    ctx.fillStyle = "var(--color-background)"
    ctx.lineWidth = 2
    for (const [x, y] of [...leftPts, ...rightPts]) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // HUD Text
    ctx.fillStyle = "var(--color-foreground)"
    ctx.font = "bold 14px var(--font-mono)"
    ctx.textAlign = "right"
    ctx.fillText(`T: ${currentTime.toFixed(2)}s`, W - 20, 30)
    ctx.fillText(`AMP: ${Math.abs(currentAmplitude).toFixed(3)}m`, W - 20, 50)

  }, [currentDeflections, currentTime, floors, currentAmplitude, safety.status, isAnimating])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      
      {/* Controls Panel */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50"
      >
            <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-civil-500" /> Parameter Gempa (SNI 1726)
          </h2>
        </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              
              <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
                <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Analisis Statik Ekuivalen</p>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung Gaya Geser Dasar ($V$) dan Simpangan Antar Lantai (Story Drift) berdasarkan Kategori Sistem Penahan Gaya Seismik SNI 1726.</p>
              </div>

              {/* Floors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Tinggi Gedung</label>
                  <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{floors} Lantai</span>
                </div>
                <input
                  type="range" min={3} max={20} value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  className="w-full accent-civil-500"
                />
                <p className="text-xs text-[var(--color-muted-foreground)]">Makin tinggi gedung, goyangan di lantai atas akan makin terasa.</p>
              </div>

              {/* Material */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Bahan Utama Struktur</label>
                <div className="flex flex-col gap-3">
                  {MATERIALS.map((m) => (
                    <label key={m.value} className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      material === m.value 
                        ? "border-civil-500 bg-civil-500/10 ring-1 ring-civil-500" 
                        : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
                    )}>
                      <input 
                        type="radio" name="material" value={m.value}
                        checked={material === m.value}
                        onChange={() => setMaterial(m.value)}
                        className="sr-only"
                      />
                      <div className={cn("mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center", material === m.value ? "border-civil-500" : "border-gray-400")}>
                        {material === m.value && <div className="w-2 h-2 rounded-full bg-civil-500" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-bold", material === m.value ? "text-civil-700 dark:text-civil-300" : "text-[var(--color-foreground)]")}>{m.label}</span>
                        <span className="text-xs mt-1 text-[var(--color-muted-foreground)] leading-relaxed">{m.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Magnitude */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Percepatan Spektral (SDS)</label>
                  <span className="text-sm font-mono font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">{((magnitude / 10) * 1.5).toFixed(2)} g</span>
                </div>
                <input
                  type="range" min={1} max={10} step={0.5} value={magnitude}
                  onChange={(e) => setMagnitude(Number(e.target.value))}
                  className="w-full accent-destructive"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-[var(--color-border)]">
              {isAnimating ? (
                <button
                  onClick={stopAnimation}
                  className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
                >
                  <Square size={16} fill="currentColor" /> Hentikan
                </button>
              ) : (
                <button
                  onClick={startAnimation}
                  className="w-full py-3 rounded-lg bg-civil-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-civil-600 shadow-[var(--shadow-glow)] transition-all active:scale-95"
                >
                  <Play size={16} fill="currentColor" /> Simulasikan
                </button>
              )}
            </div>
          </motion.div>
      
      {/* 
        MAIN CANVAS AREA 
      */}
      <div className="relative flex-1 bg-[var(--color-background)]">

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Base Shear (Gaya Geser Dasar)</span>
            <span className="font-mono font-bold text-lg text-destructive">
              {result.baseShear.toFixed(0)} kN
            </span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Simpangan Atap Maks / Izin</span>
            <span className={cn("font-mono font-bold text-lg", result.maxDrift > result.allowableDrift ? "text-destructive" : "text-safe")}>
              {result.maxDrift.toFixed(2)}m / {result.allowableDrift.toFixed(2)}m
            </span>
          </div>
        </div>

        {/* HUD Status - Floating Bottom */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={safety.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4",
              safety.status === "danger" ? "border-l-destructive" : 
              safety.status === "warning" ? "border-l-warning" : "border-l-safe"
            )}
          >
            <div className={cn(
              "p-2 rounded-full",
              safety.status === "danger" ? "bg-destructive/20 text-destructive" : 
              safety.status === "warning" ? "bg-warning/20 text-warning" : "bg-safe/20 text-safe"
            )}>
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{safety.status === "safe" ? "Status Aman" : "Peringatan Struktural"}</h3>
              <p className="text-sm font-medium leading-relaxed">{safety.message}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
