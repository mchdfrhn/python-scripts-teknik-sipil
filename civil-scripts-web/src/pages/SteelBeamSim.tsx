import { MetricDisplay } from "@/components/shared/MetricDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState, useMemo } from "react"
import { calculateBeam } from "@/lib/physics/models"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"
import { Settings2 } from "lucide-react"

export function SteelBeamSim() {
  const [length, setLength] = useState(10)
  const [load, setLoad] = useState(50)
  const [profile, setProfile] = useState<"WF200" | "WF300" | "WF400">("WF200")
  const [material, setMaterial] = useState<"BJ37" | "BJ41" | "BJ50">("BJ37")

  const result = useMemo(() => calculateBeam(length, load, profile, material), [length, load, profile, material])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg flex flex-col md:flex-row">
      
      {/* Controls Panel */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col"
      >
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-civil-500" /> Parameter Baja (SNI 1729)
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
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">PROFIL BAJA (WF)</label>
            <select value={profile} onChange={(e) => setProfile(e.target.value as any)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value="WF200">WF 200x100 (Ringan)</option>
              <option value="WF300">WF 300x150 (Sedang)</option>
              <option value="WF400">WF 400x200 (Berat)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)]">MUTU BAJA</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value as any)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value="BJ37">BJ 37 (Fy = 240 MPa)</option>
              <option value="BJ41">BJ 41 (Fy = 250 MPa)</option>
              <option value="BJ50">BJ 50 (Fy = 290 MPa)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main View */}
      <div className="flex-1 flex flex-col relative p-6 overflow-y-auto space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricDisplay 
            label="Momen Lentur (Mu)" 
            value={result.maxMomen} 
            unit={`kNm / Max: ${result.phiMn.toFixed(1)}`} 
            status={result.maxMomen > result.phiMn ? "danger" : "safe"} 
          />
          <MetricDisplay 
            label="Gaya Geser (Vu)" 
            value={result.maxGeser} 
            unit={`kN / Max: ${result.phiVn.toFixed(1)}`} 
            status={result.maxGeser > result.phiVn ? "danger" : "safe"} 
          />
          <MetricDisplay 
            label="Lendutan Aktual" 
            value={result.maxDeflection} 
            unit={`mm / Izin: ${result.limitDeflection.toFixed(1)}`} 
            status={result.maxDeflection > result.limitDeflection ? "danger" : "safe"} 
          />
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
        <StatusBadge status={result.status}>{result.msg}</StatusBadge>
      </div>
    </div>
  )
}
