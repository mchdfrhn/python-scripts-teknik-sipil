import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateHydrology } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function HydrologySim() {
  const [rain, setRain] = useState<"ringan" | "sedang" | "lebat">("sedang")
  const [gates, setGates] = useState(1)

  const result = useMemo(() => calculateHydrology(rain, gates), [rain, gates])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Operasi Bendungan</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">INTENSITAS HUJAN</label><select value={rain} onChange={(e) => setRain(e.target.value as "ringan" | "sedang" | "lebat")} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]"><option value="ringan">Gerimis (Ringan)</option><option value="sedang">Hujan Deras (Sedang)</option><option value="lebat">Badai Tropis (Ekstrem)</option></select></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">PINTU AIR DIBUKA</label><span className="text-sm font-bold text-civil-500">{gates} Pintu</span></div><input type="range" min={0} max={5} value={gates} onChange={(e) => setGates(Number(e.target.value))} className="w-full accent-civil-500" /></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <MetricDisplay label="Total Volume Air Tertahan" value={result.totalVolumeStored} unit="Ribu m³" status={result.status} />
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">HIDROGRAF DEBIT BANJIR (m³/detik)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={result.hydrograph}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" label={{ value: 'Jam ke-', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="inflow" name="Air Masuk (Banjir)" stroke="var(--color-destructive)" fill="var(--color-destructive)" fillOpacity={0.1} isAnimationActive={false} />
              <Area type="monotone" dataKey="outflow" name="Air Keluar (Dibuang)" stroke="var(--color-civil-500)" fill="var(--color-civil-500)" fillOpacity={0.3} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
