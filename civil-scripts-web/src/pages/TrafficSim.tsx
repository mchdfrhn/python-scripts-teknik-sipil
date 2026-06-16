import { useState, useMemo } from "react"
import { calculateTraffic } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function TrafficSim() {
  const [volume, setVolume] = useState(2500)
  const [lanes, setLanes] = useState(2)

  const result = useMemo(() => calculateTraffic(volume, lanes), [volume, lanes])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis MKJI 1997</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Analisis Kapasitas Jalan</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung Derajat Kejenuhan (DS) dan Level of Service (LOS) berdasarkan Manual Kapasitas Jalan Indonesia (MKJI 1997).</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Volume Lalu Lintas</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{volume} smp/j</span>
            </div>
            <input type="range" min={500} max={8000} step={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Jumlah ekuivalen mobil penumpang per jam.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Jumlah Lajur</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{lanes} Lajur</span>
            </div>
            <input type="range" min={1} max={4} value={lanes} onChange={(e) => setLanes(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Jumlah total lajur pada jalan yang ditinjau.</p>
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Animated Traffic Simulation */}
        <div className="absolute inset-0 w-full h-full bg-zinc-900 dark:bg-zinc-950 flex flex-col justify-center overflow-hidden pb-32">
          <div className="relative w-full flex flex-col justify-center gap-2">
            {Array.from({length: lanes}).map((_, laneIdx) => (
              <div key={laneIdx} className="h-16 w-full bg-zinc-800 border-y border-dashed border-zinc-600 relative overflow-hidden">
                {result.cars.filter(c => c.lane === laneIdx).map((car) => (
                  <motion.div
                    key={car.id}
                    className={cn(
                      "absolute top-3 w-12 h-10 rounded-md shadow-md",
                      result.los === 'F' ? "bg-red-500" : result.los === 'E' ? "bg-amber-500" : "bg-civil-500"
                    )}
                    initial={{ left: -50 }}
                    animate={{ left: ["-10%", "110%"] }}
                    transition={{
                      duration: 100 / car.speed,
                      repeat: Infinity,
                      ease: "linear",
                      delay: (car.id * 0.5) % 3
                    }}
                  >
                    {/* Headlights */}
                    <div className="absolute right-0 top-1 w-1.5 h-2.5 bg-yellow-200 shadow-[2px_0_5px_yellow]" />
                    <div className="absolute right-0 bottom-1 w-1.5 h-2.5 bg-yellow-200 shadow-[2px_0_5px_yellow]" />
                    {/* Taillights */}
                    <div className={cn("absolute left-0 top-1 w-1 h-2", result.los === 'F' ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-red-800")} />
                    <div className={cn("absolute left-0 bottom-1 w-1 h-2", result.los === 'F' ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-red-800")} />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Kapasitas Total (C)</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">
              {result.capacity} smp/j
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">DS / LOS</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {result.ds.toFixed(2)} / {result.los}
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg hidden xl:flex gap-4 items-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Kap. Dasar (C0)</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.C0}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Hambatan Samping</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.FCsf}</span>
            </div>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Status Aman" : "Peringatan Lalu Lintas"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
