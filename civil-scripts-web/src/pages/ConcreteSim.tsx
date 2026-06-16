import { useState, useMemo } from "react"
import { calculateConcrete } from "@/lib/physics/models"
import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function ConcreteSim() {
  const [strength, setStrength] = useState(30)
  const [flyAsh, setFlyAsh] = useState(15)

  const result = useMemo(() => calculateConcrete(strength, flyAsh), [strength, flyAsh])

  const pieData = [
    { name: "Semen Portland", value: result.finalCement },
    { name: "Abu Batubara (Fly Ash)", value: result.flyAshMass }
  ]
  const COLORS = ['var(--color-muted-foreground)', 'var(--color-civil-500)']

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-80 glass-panel border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Komposisi Beton</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">MUTU BETON (MPa)</label><span className="text-sm font-bold">fc' {strength}</span></div><input type="range" min={20} max={40} step={10} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">SUBSTITUSI FLY ASH (%)</label><span className="text-sm font-bold text-civil-500">{flyAsh}%</span></div><input type="range" min={0} max={50} value={flyAsh} onChange={(e) => setFlyAsh(Number(e.target.value))} className="w-full accent-civil-500" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MetricDisplay label="Pengurangan Emisi CO2" value={result.co2_reduction} unit="%" status={result.status as any} />
          <MetricDisplay label="Faktor Air Semen (FAS)" value={result.w_c} unit="Ratio" status="neutral" />
        </div>
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">PROPORSI PENGIKAT (kg/m³)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <StatusBadge status={result.status as any}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
