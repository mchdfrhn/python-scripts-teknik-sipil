import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { usePhysics } from "@/hooks/usePhysics"
import { useState, useMemo, useRef } from "react"
import { calculateSoilBearing as localCalculateSoilBearing } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"

import { SoilBearing3D } from "@/components/visualizations/SoilBearing3D"

export function SoilBearingSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [width, setWidth] = useState(1.0)
  const [cohesion, setCohesion] = useState(20)
  const [phi, setPhi] = useState(15)
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculateSoilBearing",
    (p) => localCalculateSoilBearing(p.width, p.cohesion, p.phi),
    useMemo(() => ({ width, cohesion, phi }), [width, cohesion, phi])
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
        title="Daya Dukung Tanah" 
        subtitle="Kapasitas Meyerhof"
        inputs={[
          {label: "Lebar Pondasi (B)", value: width + " m"},
          {label: "Kohesi (c)", value: cohesion + " kPa"},
          {label: "Sudut Geser (φ)", value: phi + " °"},
        ]}
        results={[
          {label: "Daya Dukung Ultimit (qult)", value: result.q_ult.toFixed(2) + " kPa"},
          {label: "Daya Dukung Izin (qall)", value: result.q_all.toFixed(2) + " kPa"},
          {label: "Faktor Nc", value: result.Nc.toFixed(2)},
          {label: "Faktor Nq", value: result.Nq.toFixed(2)},
          {label: "Faktor Nγ", value: result.Ngamma.toFixed(2)},
        ]}
        conclusionMsg={result.msg}
        conclusionStatus={result.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Daya_Dukung_Tanah_${Date.now()}.pdf`;
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
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis Meyerhof</h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Kapasitas Dukung Tanah</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung daya dukung ultimit dan izin pondasi dangkal berdasarkan teori Meyerhof.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: MEYERHOF (GENERAL BEARING)</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Lebar Pondasi (B)</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{width} m</span>
            </div>
            <input type="range" min={0.5} max={5} step={0.5} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Kohesi (c)</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{cohesion} kPa</span>
            </div>
            <input type="range" min={0} max={100} value={cohesion} onChange={(e) => setCohesion(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Sudut Geser (φ)</label>
              <span className="text-sm font-mono font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">{phi}°</span>
            </div>
            <input type="range" min={0} max={45} value={phi} onChange={(e) => setPhi(Number(e.target.value))} className="w-full accent-amber-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Sudut gesekan dalam material tanah.</p>
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

      <div className="relative flex-1 bg-[var(--color-background)]" ref={exportRef}>
        
        {/* 3D Visualization Area */}
        <div className="absolute inset-0 w-full h-full cursor-move">
          <SoilBearing3D width={width} status={result.status} q_ult={result.q_ult} />
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end text-amber-600">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Ultimit (qult)</span>
            <span className="font-mono font-bold text-lg">{result.q_ult.toFixed(1)} <span className="text-xs">kPa</span></span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end text-amber-600">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Izin (qall)</span>
            <span className="font-mono font-bold text-lg">{result.q_all.toFixed(1)} <span className="text-xs">kPa</span></span>
          </div>
        </div>

        {/* HUD Status - Floating Bottom */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={result.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 backdrop-blur-md",
              result.status === "danger" ? "border-l-destructive bg-destructive/10 dark:bg-destructive/20" : 
              result.status === "warning" ? "border-l-warning bg-warning/10 dark:bg-warning/20" : "border-l-safe bg-safe/10 dark:bg-safe/20"
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">Kapasitas Tanah</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="soil_bearing" />
    </div>
  )
}
