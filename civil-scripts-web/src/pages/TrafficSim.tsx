import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateTraffic } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function TrafficSim() {
  const [volume, setVolume] = useState(2500)
  const [lanes, setLanes] = useState(2)

  const result = useMemo(() => calculateTraffic(volume, lanes), [volume, lanes])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Jalan Raya</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">VOLUME LALU LINTAS (smp/jam)</label><span className="text-sm font-bold">{volume}</span></div><input type="range" min={500} max={600} step={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">JUMLAH LAJUR</label><span className="text-sm font-bold text-civil-500">{lanes} Lajur</span></div><input type="range" min={1} max={4} value={lanes} onChange={(e) => setLanes(Number(e.target.value))} className="w-full accent-civil-500" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricDisplay label="Kapasitas Total" value={result.totalCapacity} unit="smp/jam" status="neutral" />
          <MetricDisplay label="V/C Ratio" value={result.vcr} unit="Ratio" status={result.status} />
          <MetricDisplay label="Level of Service" value={result.los} unit="LOS" status={result.status} />
        </div>
        
        {/* Animated Traffic Simulation */}
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-zinc-900 dark:bg-zinc-950 p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <h3 className="text-sm font-bold text-center mb-4 text-zinc-400 absolute top-4 inset-x-0 z-10">SIMULASI KEMACETAN (REAL-TIME)</h3>
          
          <div className="relative w-full h-64 flex flex-col justify-center gap-2">
            {Array.from({length: lanes}).map((_, laneIdx) => (
              <div key={laneIdx} className="h-12 w-full bg-zinc-800 border-y border-dashed border-zinc-600 relative overflow-hidden">
                {result.cars.filter(c => c.lane === laneIdx).map((car) => (
                  <motion.div
                    key={car.id}
                    className={cn(
                      "absolute top-2 w-10 h-8 rounded-md shadow-md",
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
                    <div className="absolute right-0 top-1 w-1 h-2 bg-yellow-200 shadow-[2px_0_5px_yellow]" />
                    <div className="absolute right-0 bottom-1 w-1 h-2 bg-yellow-200 shadow-[2px_0_5px_yellow]" />
                    {/* Taillights */}
                    <div className={cn("absolute left-0 top-1 w-1 h-2", result.los === 'F' ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-red-800")} />
                    <div className={cn("absolute left-0 bottom-1 w-1 h-2", result.los === 'F' ? "bg-red-500 shadow-[0_0_8px_red]" : "bg-red-800")} />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
