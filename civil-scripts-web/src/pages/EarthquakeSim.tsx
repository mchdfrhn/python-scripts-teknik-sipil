import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import {
  calculateEarthquake as localCalculateEarthquake,
  getEarthquakeStatus,
} from "@/lib/physics/earthquake"
import { usePhysics } from "@/hooks/usePhysics"
import { useMetadata } from "@/hooks/useMetadata"
import { motion } from "framer-motion"
import { Play, Square, Settings2, Info, Loader2, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"

import { Earthquake3D } from "@/components/visualizations/Earthquake3D"

export function EarthquakeSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [floors, setFloors] = useState(10)
  const [material, setMaterial] = useState<string>("SRPMK")
  const [magnitude, setMagnitude] = useState(6.0) 
  const [chartMode, setChartMode] = useState<"2d" | "3d">("3d")

  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { metadata, isLoading: isMetaLoading } = useMetadata();

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculateEarthquake",
    (p) => {
      const res = localCalculateEarthquake({ ...p, metadata });
      if (!res) return null;
      const safety = getEarthquakeStatus(res.maxDrift, res.allowableDrift);
      return {
        ...res,
        status: safety.status,
        message: safety.message,
        deflections: [],
      };
    },
    useMemo(() => ({ floors, material, magnitude }), [floors, material, magnitude])
  )

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      setIsExporting(true);
      let base64Image = '';
      if (exportRef.current) {
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        base64Image = canvas.toDataURL('image/png');
      }

      const doc = <StandardReport 
        title="Goyangan Gedung Bertingkat" 
        subtitle="SNI 1726"
        inputs={[
          {label: "Jumlah Lantai", value: floors + " Lantai"},
          {label: "Intensitas Gempa", value: magnitude},
        ]}
        results={[
          {label: "Base Shear", value: result.baseShear.toFixed(2) + " kN"},
          {label: "Max Drift", value: result.maxDrift.toFixed(3) + " m"},
        ]}
        conclusionMsg={safety.message}
        conclusionStatus={safety.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Gempa_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      console.error("Gagal export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  // Animation logic helpers
  const T = useMemo(() => 0.0466 * Math.pow(floors * 4.0, 0.9), [floors])
  const freq = 1 / T

  const currentAmplitude = useMemo(() => {
    if (!result) return 0
    return result.maxDrift * Math.exp(-result.damping * 2 * currentTime) * Math.sin(2 * Math.PI * freq * currentTime)
  }, [result, currentTime, freq])

  const currentDeflections = useMemo(() => {
    if (!result) return []
    const defs: number[] = []
    for (let i = 0; i <= floors; i++) {
      defs.push(currentAmplitude * Math.pow(i / floors, 1.5))
    }
    return defs
  }, [result, currentAmplitude, floors])

  const safety = result ? getEarthquakeStatus(result.maxDrift, result.allowableDrift) : { status: "neutral" as const, message: "Calculating..." }

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

    ctx.strokeStyle = "var(--color-border)"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, H - padBottom)
    ctx.lineTo(W, H - padBottom)
    ctx.stroke()

    const leftPts: [number, number][] = []
    const rightPts: [number, number][] = []

    for (let i = 0; i <= floors; i++) {
      const y = H - padBottom - i * floorH
      const deflection = currentDeflections[i] ?? 0
      const px = centerX + deflection * 15

      leftPts.push([px - columnOffset, y])
      rightPts.push([px + columnOffset, y])
    }

    ctx.strokeStyle = "var(--color-muted-foreground)"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    for (let i = 0; i <= floors; i++) {
      ctx.beginPath()
      ctx.moveTo(leftPts[i][0] - 10, leftPts[i][1])
      ctx.lineTo(rightPts[i][0] + 10, rightPts[i][1])
      ctx.stroke()
    }

    ctx.strokeStyle = "var(--color-civil-500)"
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(leftPts[0][0], leftPts[0][1])
    for (let i = 1; i <= floors; i++) {
      ctx.lineTo(leftPts[i][0], leftPts[i][1])
    }
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(rightPts[0][0], rightPts[0][1])
    for (let i = 1; i <= floors; i++) {
      ctx.lineTo(rightPts[i][0], rightPts[i][1])
    }
    ctx.stroke()

  }, [currentDeflections, floors])

  if (isMetaLoading || !result) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-civil-500" size={48} />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50"
      >
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-civil-500" /> Analisis SNI 1726
          </h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Goyangan Gedung Bertingkat</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Mensimulasikan respon elastik dan inelastik gedung terhadap beban gempa berdasarkan sistem pemikul momen.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: STATIK EKUIVALEN</span></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Jumlah Lantai</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{floors} Lantai</span>
            </div>
            <input type="range" min={3} max={20} value={floors} onChange={(e) => setFloors(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Mode Visualisasi</label>
            <div className="flex bg-[var(--color-secondary)] p-1 rounded-lg">
              {(["3d", "2d"] as const).map(mode => (
                <button key={mode} onClick={() => setChartMode(mode)} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors", chartMode === mode ? "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]")}>
                  {mode === "3d" ? "3D VIEW" : "CETAK BIRU (2D)"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Sistem Struktur</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              {metadata && Object.entries(metadata.EARTHQUAKE_SYSTEMS).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Intensitas Gempa</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{magnitude.toFixed(1)}</span>
            </div>
            <input type="range" min={1} max={10} step={0.5} value={magnitude} onChange={(e) => setMagnitude(Number(e.target.value))} className="w-full accent-destructive" />
          </div>
        </div>

        <div className="p-5 border-t border-[var(--color-border)] flex flex-col gap-3">
          <button 
            onClick={isAnimating ? stopAnimation : startAnimation}
            className={cn(
              "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              isAnimating ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-civil-500 text-white hover:bg-civil-600 shadow-civil-500/25"
            )}
          >
            {isAnimating ? <><Square size={18} fill="currentColor" /> Hentikan</> : <><Play size={18} fill="currentColor" /> Mulai Simulasi</>}
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Unduh Laporan PDF
          </button>
        </div>
      </motion.div>

      <div className="relative flex-1 bg-[var(--color-background)]" ref={exportRef}>
        <div className="absolute inset-0 w-full h-full cursor-move">
          {chartMode === "3d" ? (
            <Earthquake3D floors={floors} deflections={currentDeflections} status={safety.status} />
          ) : (
            <canvas ref={canvasRef} className="w-full h-full" />
          )}
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none flex-wrap justify-end">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Base Shear (V)</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">{result.baseShear.toFixed(0)} <span className="text-xs text-[var(--color-muted-foreground)]">kN</span></span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">SDS (Spectral)</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">{result.Sds.toFixed(2)} <span className="text-xs text-[var(--color-muted-foreground)]">g</span></span>
          </div>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={safety.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 backdrop-blur-md",
              safety.status === "danger" ? "border-l-destructive bg-destructive/10 dark:bg-destructive/20" : 
              safety.status === "warning" ? "border-l-warning bg-warning/10 dark:bg-warning/20" : "border-l-safe bg-safe/10 dark:bg-safe/20"
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{safety.status === "safe" ? "Kondisi Aman" : "Peringatan Keamanan"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{safety.message}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="earthquake" />
    </div>
  )
}
