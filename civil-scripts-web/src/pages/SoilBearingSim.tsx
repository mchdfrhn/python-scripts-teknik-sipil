import { useState, useMemo } from "react"
import { calculateSoilBearing } from "@/lib/physics/models"
import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function SoilBearingSim() {
  const [width, setWidth] = useState(1.0)
  const [cohesion, setCohesion] = useState(20)
  const [phi, setPhi] = useState(15)

  const result = useMemo(() => calculateSoilBearing(width, cohesion, phi), [width, cohesion, phi])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-80 glass-panel border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Tanah</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">LEBAR PONDASI (m)</label><span className="text-sm font-bold">{width.toFixed(1)}m</span></div><input type="range" min={0.5} max={3.0} step={0.1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">KOHESI TANAH (kPa)</label><span className="text-sm font-bold text-amber-500">{cohesion}</span></div><input type="range" min={0} max={100} value={cohesion} onChange={(e) => setCohesion(Number(e.target.value))} className="w-full accent-amber-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">SUDUT GESER (derajat)</label><span className="text-sm font-bold text-amber-500">{phi}°</span></div><input type="range" min={0} max={45} value={phi} onChange={(e) => setPhi(Number(e.target.value))} className="w-full accent-amber-500" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MetricDisplay label="Daya Dukung Ultimate (Maks)" value={result.q_ult} unit="kPa" status="neutral" />
          <MetricDisplay label="Daya Dukung Izin (Aman)" value={result.q_all} unit="kPa" status={result.status as any} />
        </div>
        
        {/* Simple visual representation */}
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
          
          <div className="relative flex flex-col items-center">
            {/* Column */}
            <div className="w-8 h-32 bg-[var(--color-muted-foreground)]" />
            {/* Footing */}
            <motion.div 
              className="h-12 bg-civil-500 rounded-sm"
              animate={{ width: width * 100 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
            {/* Ground line */}
            <div className="w-96 h-1 mt-4 bg-[var(--color-border)]" />
            
            {/* Pressure bulbs (conceptual) */}
            <motion.div 
              className="absolute top-[180px] rounded-[100%] border-2 border-dashed border-amber-500/50"
              animate={{ 
                width: width * 100 * 1.5, 
                height: width * 100,
                opacity: result.status === 'danger' ? 1 : 0.5
              }}
            />
            <motion.div 
              className="absolute top-[180px] rounded-[100%] border-2 border-dashed border-amber-500/30"
              animate={{ 
                width: width * 100 * 2.5, 
                height: width * 100 * 1.8,
              }}
            />
          </div>
        </div>
        <StatusBadge status={result.status as any}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
