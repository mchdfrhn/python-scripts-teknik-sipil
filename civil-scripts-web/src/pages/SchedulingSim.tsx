import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateSchedule } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function SchedulingSim() {
  const [delay, setDelay] = useState(0)

  const result = useMemo(() => calculateSchedule(delay), [delay])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-80 glass-panel border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Proyek</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">KENDALA CUACA / MATERIAL</label><span className="text-sm font-bold text-destructive">Tunda {delay} hari</span></div><input type="range" min={0} max={15} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="w-full accent-destructive" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <MetricDisplay label="Total Durasi Proyek" value={result.totalDuration} unit="Hari Kerja" status={result.status} />
        
        {/* Gantt Chart UI */}
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-center mb-6 text-[var(--color-muted-foreground)]">GANTT CHART & JALUR KRITIS (CPM)</h3>
          
          <div className="flex-1 space-y-4">
            {result.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-48 text-sm font-medium truncate text-right">{task.name}</div>
                <div className="flex-1 h-8 bg-[var(--color-secondary)] rounded-md relative overflow-hidden">
                  <motion.div 
                    className={`absolute top-0 bottom-0 rounded-md ${task.critical ? 'bg-destructive/80' : 'bg-civil-500/80'}`}
                    animate={{ 
                      left: `${(task.start / result.totalDuration) * 100}%`,
                      width: `${((task.end - task.start) / result.totalDuration) * 100}%`
                    }}
                    transition={{ type: "spring", bounce: 0 }}
                  >
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {task.end - task.start}h
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline axis */}
          <div className="mt-4 flex items-center gap-4">
            <div className="w-48" />
            <div className="flex-1 flex justify-between text-xs font-mono text-[var(--color-muted-foreground)] border-t border-[var(--color-border)] pt-2">
              <span>0</span>
              <span>Hari ke-{result.totalDuration}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
