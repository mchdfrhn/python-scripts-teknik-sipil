import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { usePhysics } from "@/hooks/usePhysics"
import { useState, useMemo, useRef } from "react"
import { calculateTraffic as localCalculateTraffic } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"

export function TrafficSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [volume, setVolume] = useState(2500)
  const [lanes, setLanes] = useState(2)
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculateTraffic",
    (p) => localCalculateTraffic(p.volume, p.lanes),
    useMemo(() => ({ volume, lanes }), [volume, lanes])
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
        title="Analisis Kapasitas Jalan" 
        subtitle="Manual Kapasitas Jalan Indonesia (MKJI 1997)"
        inputs={[
          {label: "Volume Lalu Lintas (V)", value: volume + " smp/jam"},
          {label: "Jumlah Lajur", value: lanes + " Lajur"},
        ]}
        results={[
          {label: "Kapasitas (C)", value: result.capacity.toFixed(0) + " smp/jam"},
          {label: "Derajat Kejenuhan (DS)", value: result.ds.toFixed(2), isAlert: result.ds > 0.85},
          {label: "Level of Service (LOS)", value: result.los},
        ]}
        conclusionMsg={result.msg}
        conclusionStatus={result.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Lalu_Lintas_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      console.error("Gagal export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  if (!result) return null;

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis MKJI 1997</h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Analisis Kapasitas Jalan</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung Derajat Kejenuhan (DS) dan Level of Service (LOS) berdasarkan Manual Kapasitas Jalan Indonesia (MKJI 1997).</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: MKJI 1997 (DS = V/C)</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Volume (V)</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{volume} smp/j</span>
            </div>
            <input type="range" min={500} max={8000} step={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-destructive" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Jumlah Lajur</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{lanes} Lajur</span>
            </div>
            <input type="range" min={1} max={4} value={lanes} onChange={(e) => setLanes(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>
        </div>

        <div className="p-5 border-t border-[var(--color-border)]">
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

      <div className="relative flex-1 bg-zinc-900 dark:bg-zinc-950 overflow-hidden" ref={exportRef}>
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-4">
          {Array.from({length: lanes}).map((_, laneIdx) => (
            <div key={laneIdx} className="relative h-20 w-full border-y border-dashed border-zinc-700 flex items-center">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800"></div>
              {result.cars.filter(c => c.lane === laneIdx).map((car) => (
                <motion.div 
                  key={car.id}
                  initial={{ x: -100 }}
                  animate={{ x: '120vw' }}
                  transition={{ 
                    duration: 100 / car.speed, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: car.id * 0.5
                  }}
                  className="absolute w-12 h-6 bg-civil-500 rounded-sm shadow-lg flex items-center justify-center"
                >
                  <div className="w-2 h-1 bg-white/30 rounded-full absolute right-1"></div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:block">Kapasitas (C)</span>
            <span className="font-mono font-bold text-lg text-white">{result.capacity.toFixed(0)}</span>
          </div>
          <div className="glass-panel bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:block">DS (V/C)</span>
            <span className={cn("font-mono font-bold text-lg", result.ds > 0.85 ? "text-destructive" : "text-safe")}>{result.ds.toFixed(2)}</span>
          </div>
          <div className="glass-panel bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:block">LOS</span>
            <span className={cn("font-mono font-bold text-lg", result.ds > 0.85 ? "text-destructive" : "text-safe")}>{result.los}</span>
          </div>
        </div>

        {/* HUD Status - Floating Bottom */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={result.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 backdrop-blur-md bg-black/60 border-zinc-800",
              result.status === "danger" ? "border-l-destructive" : 
              result.status === "warning" ? "border-l-warning" : "border-l-safe"
            )}
          >
            <div className={cn(
              "p-2 rounded-full",
              result.status === "danger" ? "bg-destructive/20 text-destructive" : 
              result.status === "warning" ? "bg-warning/20 text-warning" : "bg-safe/20 text-safe"
            )}>
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider text-white">Status Lalu Lintas</h3>
              <p className="text-sm font-medium leading-relaxed text-zinc-300">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="traffic" />
    </div>
  )
}
