import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { usePhysics } from "@/hooks/usePhysics"
import { useState, useMemo, useRef } from "react"
import { calculateSchedule as localCalculateSchedule } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"

export function SchedulingSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [durs, setDurs] = useState({ A: 3, B: 5, C: 7, D: 6, E: 4, F: 3 });
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculateScheduling",
    (p) => localCalculateSchedule(p),
    useMemo(() => ({ ...durs }), [durs])
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
        title="Penjadwalan Proyek Konstruksi" 
        subtitle="Critical Path Method (CPM)"
        inputs={Object.entries(durs).map(([k,v]) => ({label: `Durasi Pekerjaan ${k}`, value: v + " hari"}))}
        results={[
          {label: "Total Durasi Proyek", value: result.totalDuration + " hari"},
          {label: "Jalur Kritis", value: result.critical_path.join(" → ")},
        ]}
        conclusionMsg={result.msg}
        conclusionStatus={result.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Jadwal_Proyek_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      console.error("Gagal export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  if (!result) return null;

  const taskInputs = [
    { key: 'A', name: 'A: Persiapan Lahan', min: 1, max: 10 },
    { key: 'B', name: 'B: Galian Pondasi', min: 1, max: 15 },
    { key: 'C', name: 'C: Cor Pondasi', min: 1, max: 20 },
    { key: 'D', name: 'D: Pasang Dinding', min: 1, max: 20 },
    { key: 'E', name: 'E: Rangka Atap', min: 1, max: 15 },
    { key: 'F', name: 'F: Finishing & Cat', min: 1, max: 15 },
  ] as const;

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis CPM</h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Manajemen Proyek (CPM)</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Mensimulasikan pengaruh durasi tiap pekerjaan pada total durasi proyek menggunakan Critical Path Method.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: CRITICAL PATH METHOD</span></div>
          </div>

          {taskInputs.map(task => (
            <div key={task.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">{task.name}</label>
                <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{durs[task.key as keyof typeof durs]} hr</span>
              </div>
              <input 
                type="range" min={task.min} max={task.max} 
                value={durs[task.key as keyof typeof durs]} 
                onChange={(e) => setDurs(prev => ({ ...prev, [task.key]: Number(e.target.value) }))} 
                className="w-full accent-civil-500" 
              />
            </div>
          ))}
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

      <div className="relative flex-1 bg-[var(--color-background)] overflow-hidden" ref={exportRef}>
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 flex flex-col justify-center gap-8">
          <div className="flex flex-wrap justify-center gap-4">
            {result.tasks.map((t, idx) => (
              <motion.div 
                key={idx}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center gap-1 min-w-[120px] shadow-sm",
                  t.critical ? "border-destructive bg-destructive/5" : "border-[var(--color-border)] bg-[var(--color-card)]"
                )}
              >
                <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-tighter">{t.name.split(':')[0]}</span>
                <span className="font-bold text-sm text-center">{t.name.split(':')[1]}</span>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
                  <span className="bg-[var(--color-secondary)] px-1.5 rounded">{t.start}-{t.end}</span>
                  <span className={cn("px-1.5 rounded", t.slack > 0 ? "bg-safe/20 text-safe" : "bg-destructive/20 text-destructive")}>S:{t.slack}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-muted-foreground)]">
              JALUR KRITIS: {result.critical_path.join(' → ')}
            </div>
            <div className="h-1.5 w-64 bg-[var(--color-border)] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-destructive"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Total Durasi</span>
            <span className="font-mono font-bold text-lg text-civil-500">{result.totalDuration} <span className="text-xs">hari</span></span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">Simpulan Penjadwalan</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="scheduling" />
    </div>
  )
}
