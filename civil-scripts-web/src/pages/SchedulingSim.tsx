import { MethodModal } from "@/components/shared/MethodModal"
import { useState, useMemo } from "react"
import { calculateSchedule } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function SchedulingSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [durs, setDurs] = useState({ A: 3, B: 5, C: 7, D: 6, E: 4, F: 3 });

  const result = useMemo(() => calculateSchedule(durs), [durs])

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
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Manajemen Proyek (CPM)</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Mensimulasikan pengaruh durasi tiap pekerjaan pada total durasi proyek menggunakan Critical Path Method.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: CRITICAL PATH METHOD (CPM)</span></div>
          </div>
          <div className="space-y-4">
            {taskInputs.map((task) => (
              <div key={task.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">{task.name}</label>
                  <span className="text-sm font-mono font-bold bg-secondary text-foreground px-2 py-0.5 rounded">{durs[task.key as keyof typeof durs]} hr</span>
                </div>
                <input 
                  type="range" 
                  min={task.min} 
                  max={task.max} 
                  value={durs[task.key as keyof typeof durs]} 
                  onChange={(e) => setDurs(prev => ({ ...prev, [task.key]: Number(e.target.value) }))} 
                  className="w-full accent-civil-500" 
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Gantt Chart UI */}
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-40 pt-28 overflow-y-auto flex flex-col justify-center">
          <div className="flex-1 w-full max-w-4xl mx-auto min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 md:p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-center mb-6 text-[var(--color-muted-foreground)]">GANTT CHART & JALUR KRITIS (CPM)</h3>
            
            <div className="flex-1 space-y-4">
              {result.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 md:w-36 text-xs md:text-sm font-medium truncate text-right text-[var(--color-foreground)]" title={task.name}>{task.shortName}</div>
                  <div className="flex-1 h-8 bg-[var(--color-secondary)] rounded-md relative overflow-hidden group">
                    {/* Slack Indicator */}
                    {!task.critical && task.slack > 0 && (
                      <motion.div 
                        className="absolute top-[14px] h-[4px] border-t-4 border-dashed border-civil-500/40 z-0"
                        animate={{ 
                          left: `${(task.end / result.totalDuration) * 100}%`,
                          width: `${(task.slack / result.totalDuration) * 100}%`
                        }}
                        transition={{ type: "spring", bounce: 0 }}
                      >
                        <div className="absolute -top-6 hidden group-hover:block whitespace-nowrap bg-background text-foreground text-[10px] px-1 border border-border rounded">
                          Slack: +{task.slack}h
                        </div>
                      </motion.div>
                    )}

                    {/* Task Bar */}
                    <motion.div 
                      className={`absolute top-0 bottom-0 rounded-md z-10 ${task.critical ? 'bg-destructive/80' : 'bg-civil-500/80'}`}
                      animate={{ 
                        left: `${(task.start / result.totalDuration) * 100}%`,
                        width: `${(task.dur / result.totalDuration) * 100}%`
                      }}
                      transition={{ type: "spring", bounce: 0 }}
                    >
                      <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {task.dur}h
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Timeline axis */}
            <div className="mt-4 flex items-center gap-4">
              <div className="w-24 md:w-36" />
              <div className="flex-1 flex justify-between text-xs font-mono text-[var(--color-muted-foreground)] border-t border-[var(--color-border)] pt-2">
                <span>0</span>
                <span>Hari ke-{result.totalDuration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none flex-wrap justify-end">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Durasi Proyek</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {result.totalDuration} Hari
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Jalur Kritis</span>
            <span className="font-mono font-bold text-lg text-destructive">
              {result.critical_path.join(" → ")}
            </span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Jadwal Terkendali" : "Peringatan Waktu"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="scheduling" />
      </div>
  )
}
