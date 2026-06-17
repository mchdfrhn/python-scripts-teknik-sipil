import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { usePhysics } from "@/hooks/usePhysics"
import { useState, useMemo, useRef } from "react"
import { calculatePipeFlow as localCalculatePipeFlow } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"

export function PipeFlowSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [length, setLength] = useState(50)
  const [diameter, setDiameter] = useState(25) // mm
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculatePipeFlow",
    (p) => localCalculatePipeFlow(p.length, p.diameterMm),
    useMemo(() => ({ length, diameterMm: diameter }), [length, diameter])
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
        title="Analisis Aliran Pipa PVC" 
        subtitle="Persamaan Hazen-Williams"
        inputs={[
          {label: "Panjang Pipa", value: length + " m"},
          {label: "Diameter Pipa", value: diameter + " mm"},
        ]}
        results={[
          {label: "Head Loss", value: result.headLoss.toFixed(2) + " m"},
          {label: "Tekanan Akhir", value: result.finalPressure.toFixed(2) + " m"},
          {label: "Debit Aliran (Q)", value: result.Q.toFixed(5) + " m³/s"},
        ]}
        conclusionMsg={result.msg}
        conclusionStatus={result.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Pipa_${Date.now()}.pdf`;
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
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Perpipaan</h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Persamaan Hazen-Williams</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Mensimulasikan kehilangan tinggi tekan (head loss) akibat gesekan di sepanjang pipa PVC tertutup.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: HAZEN-WILLIAMS (C=140)</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Panjang Pipa</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{length} m</span>
            </div>
            <input type="range" min={10} max={500} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Diameter (Inside)</label>
              <span className="text-sm font-mono font-bold bg-civil-500/10 text-civil-600 px-2 py-0.5 rounded">{diameter} mm</span>
            </div>
            <input type="range" min={12} max={100} value={diameter} onChange={(e) => setDiameter(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Diameter nominal pipa PVC.</p>
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
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-40 pt-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.profile}>
              <defs>
                <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="distance" stroke="var(--color-muted-foreground)" />
              <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="pressure" stroke="#3b82f6" fillOpacity={1} fill="url(#colorP)" strokeWidth={3} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end text-blue-500">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Head Loss</span>
            <span className="font-mono font-bold text-lg">{result.headLoss.toFixed(2)} <span className="text-xs">m</span></span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end text-blue-500">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Tekanan Sisa</span>
            <span className="font-mono font-bold text-lg">{result.finalPressure.toFixed(2)} <span className="text-xs">m</span></span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">Status Hidrolika</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="pipe_flow" />
    </div>
  )
}
