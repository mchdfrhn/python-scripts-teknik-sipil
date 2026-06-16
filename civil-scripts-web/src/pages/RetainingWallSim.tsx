import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateRetainingWall } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function RetainingWallSim() {
  const [height, setHeight] = useState(5)
  const [soilType, setSoilType] = useState<"pasir" | "lempung">("pasir")

  const result = useMemo(() => calculateRetainingWall(height, soilType), [height, soilType])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Dinding Penahan</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">TINGGI DINDING (m)</label><span className="text-sm font-bold">{height}m</span></div><input type="range" min={2} max={10} step={0.5} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">JENIS TANAH</label><select value={soilType} onChange={(e) => setSoilType(e.target.value as "pasir" | "lempung")} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]"><option value="pasir">Pasir (Sifat Geser Baik)</option><option value="lempung">Lempung (Berpotensi Mengembang)</option></select></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricDisplay label="Gaya Dorong Tanah" value={result.Pa} unit="kN" status="neutral" />
          <MetricDisplay label="Lebar Dasar Pondasi" value={result.baseWidth} unit="Meter (m)" status="neutral" />
          <MetricDisplay label="SF Guling (Keamanan)" value={result.SF_overturning} unit="Ratio" status={result.status} />
        </div>
        
        {/* Simple visual representation */}
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm flex items-end justify-center pb-12 relative overflow-hidden">
          {/* Soil */}
          <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-amber-900/20 dark:bg-amber-900/40 rounded-tl-xl border-t border-l border-amber-900/30">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) 1px, transparent 0, transparent 10px)', backgroundSize: '15px 15px' }} />
          </div>

          <div className="relative flex items-end">
            {/* Wall */}
            <motion.div 
              className="bg-zinc-400 dark:bg-zinc-600 rounded-sm origin-bottom-right z-10"
              animate={{ 
                height: height * 40,
                width: 40,
                rotate: result.status === 'danger' ? -15 : 0 // Tipping animation if dangerous
              }}
              transition={{ type: "spring" }}
            />
            {/* Base Footing */}
            <motion.div 
              className="bg-zinc-400 dark:bg-zinc-600 rounded-sm absolute bottom-0 right-0 z-10 origin-bottom-right"
              animate={{ 
                width: result.baseWidth * 40 + 40, 
                height: 30,
                rotate: result.status === 'danger' ? -15 : 0
              }}
              transition={{ type: "spring" }}
            />
            
            {/* Force arrow */}
            <motion.div 
              className="absolute right-[-40px] border-b-4 border-l-4 border-destructive w-16 h-4 z-20"
              animate={{ top: height * 40 * 0.6 }} // Acting at H/3 from bottom
            />
          </div>
          <div className="absolute bottom-12 w-full h-1 bg-[var(--color-border)]" />
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
