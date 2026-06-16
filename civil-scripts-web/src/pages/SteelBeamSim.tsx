import { useState, useMemo } from "react"
import { calculateBeam } from "@/lib/physics/models"
import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"

export function SteelBeamSim() {
  const [length, setLength] = useState(10)
  const [load, setLoad] = useState(50)
  const [profile, setProfile] = useState<"IWF" | "HBeam" | "Hollow">("IWF")

  const result = useMemo(() => calculateBeam(length, load, profile), [length, load, profile])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      
      {/* Controls Panel */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="z-20 w-80 glass-panel border-r border-[var(--color-border)] flex flex-col"
      >
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-civil-500" /> Parameter Balok
          </h2>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">BENTANG (m)</label><span className="text-sm font-bold">{length}m</span></div>
            <input type="range" min={2} max={20} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">BEBAN TERPUSAT (kN)</label><span className="text-sm font-bold text-destructive">{load}kN</span></div>
            <input type="range" min={10} max={200} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full accent-destructive" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">PROFIL BAJA</label>
            <select value={profile} onChange={(e) => setProfile(e.target.value as any)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]">
              <option value="IWF">Baja IWF (Optimal Lentur)</option>
              <option value="HBeam">Baja H-Beam (Paling Kokoh)</option>
              <option value="Hollow">Baja Hollow (Ringan)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main View */}
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <MetricDisplay label="Momen Maksimal" value={result.maxMomen} unit="kNm" status="neutral" />
          <MetricDisplay label="Gaya Geser" value={result.maxGeser} unit="kN" status="neutral" />
          <MetricDisplay label="Lendutan (Melengkung)" value={result.maxDeflection} unit="mm" status={result.status as any} />
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[300px] border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] p-4 shadow-sm">
          <h3 className="text-sm font-bold text-center mb-4 text-[var(--color-muted-foreground)]">KURVA LENDUTAN (DEFLEKSI)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={result.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="x" label={{ value: 'Posisi Bentang (m)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Lendutan (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />
              <Line type="monotone" dataKey="def" stroke="var(--color-civil-500)" strokeWidth={4} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status */}
        <StatusBadge status={result.status as any}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
