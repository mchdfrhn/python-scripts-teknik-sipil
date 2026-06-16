import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateWindLoad } from "@/lib/physics/models"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function WindLoadSim() {
  const [height, setHeight] = useState(50)
  const [windSpeed, setWindSpeed] = useState(120)
  const [location, setLocation] = useState<"kota" | "pantai">("kota")

  const result = useMemo(() => calculateWindLoad(height, windSpeed, location), [height, windSpeed, location])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-80 glass-panel border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Angin</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">TINGGI GEDUNG (m)</label><span className="text-sm font-bold">{height}m</span></div><input type="range" min={10} max={200} step={5} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">KEC. ANGIN (km/jam)</label><span className="text-sm font-bold text-destructive">{windSpeed}km/j</span></div><input type="range" min={30} max={250} value={windSpeed} onChange={(e) => setWindSpeed(Number(e.target.value))} className="w-full accent-destructive" /></div>
          <div className="space-y-3"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">LOKASI</label><select value={location} onChange={(e) => setLocation(e.target.value as "kota" | "pantai")} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]"><option value="kota">Pusat Kota (Terhalang Gedung)</option><option value="pantai">Tepi Pantai (Terbuka Bebas)</option></select></div>
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        <MetricDisplay label="Tekanan Angin Maksimal" value={result.maxPressure} unit="Pascal (Pa)" status={result.status} />
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">PROFIL TEKANAN ANGIN (Pa) PER LANTAI</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={result.pressureList} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" label={{ value: 'Tekanan (Pa)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="z" type="category" label={{ value: 'Ketinggian (m)', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Bar dataKey="pressure" fill="var(--color-civil-500)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
