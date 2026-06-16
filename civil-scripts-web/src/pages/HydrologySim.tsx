import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateHydrology } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function HydrologySim() {
  const [rainIntensity, setRainIntensity] = useState(100)
  const [area, setArea] = useState(10)
  const [runoffCoef, setRunoffCoef] = useState(0.7)

  const result = useMemo(() => calculateHydrology(rainIntensity, area, runoffCoef), [rainIntensity, area, runoffCoef])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis Debit (SNI 2415)</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">INTENSITAS HUJAN (mm/jam)</label><span className="text-sm font-bold text-destructive">{rainIntensity}</span></div><input type="range" min={20} max={300} value={rainIntensity} onChange={(e) => setRainIntensity(Number(e.target.value))} className="w-full accent-destructive" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">LUAS DAS (km²)</label><span className="text-sm font-bold">{area}</span></div><input type="range" min={1} max={50} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">TUTUPAN LAHAN (C)</label><select value={runoffCoef} onChange={(e) => setRunoffCoef(Number(e.target.value))} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]"><option value={0.9}>0.90 - Perkotaan / Aspal Padat</option><option value={0.7}>0.70 - Permukiman / Perumahan</option><option value={0.3}>0.30 - Lahan Kosong / Pertanian</option><option value={0.1}>0.10 - Hutan Lebat</option></select></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricDisplay label="Debit Puncak (Q)" value={result.peakDischarge} unit="m³/s" status={result.status} />
          <MetricDisplay label="Total Volume Limpasan" value={result.totalVolumeM3 / 1000} unit="Ribu m³" status="neutral" />
        </div>
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">HIDROGRAF SINTETIS (m³/detik)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={result.hydrograph}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" label={{ value: 'Jam ke-', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="discharge" name="Debit Aliran (Q)" stroke="var(--color-destructive)" fill="var(--color-destructive)" fillOpacity={0.2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
