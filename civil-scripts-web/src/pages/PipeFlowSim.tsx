import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculatePipeFlow } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function PipeFlowSim() {
  const [length, setLength] = useState(50)
  const [diameter, setDiameter] = useState(25) // mm

  const result = useMemo(() => calculatePipeFlow(length, diameter), [length, diameter])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Pipa</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">PANJANG PIPA (m)</label><span className="text-sm font-bold">{length}m</span></div><input type="range" min={10} max={200} step={10} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">DIAMETER PIPA (mm)</label><span className="text-sm font-bold text-destructive">{diameter}mm</span></div><input type="range" min={12} max={100} value={diameter} onChange={(e) => setDiameter(Number(e.target.value))} className="w-full accent-destructive" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricDisplay label="Kehilangan Tekanan" value={result.headLoss} unit="Meter (m)" status="neutral" />
          <MetricDisplay label="Tekanan Tersisa di Keran" value={result.finalPressure} unit="Meter (m)" status={result.status} />
        </div>
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">PROFIL TEKANAN ALIRAN AIR SEPANJANG PIPA</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={result.profile}>
              <defs>
                <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-civil-500)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-civil-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="distance" label={{ value: 'Jarak (m)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Tekanan (m)', angle: -90, position: 'insideLeft' }} domain={[0, 10]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="pressure" stroke="var(--color-civil-500)" fillOpacity={1} fill="url(#colorPressure)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
