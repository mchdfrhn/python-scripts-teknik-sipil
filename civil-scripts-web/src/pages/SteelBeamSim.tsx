import { useState, useMemo } from "react"
import { calculateBeam } from "@/lib/physics/models"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function SteelBeamSim() {
  const [length, setLength] = useState(10)
  const [load, setLoad] = useState(50)
  const [profile, setProfile] = useState<"WF200" | "WF300" | "WF400">("WF200")
  const [material, setMaterial] = useState<"BJ37" | "BJ41" | "BJ50">("BJ37")

  const result = useMemo(() => calculateBeam(length, load, profile, material), [length, load, profile, material])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      
      {/* Controls Panel */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50"
      >
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2">
            <Settings2 size={18} className="text-civil-500" /> Analisis SNI 1729
          </h2>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Desain Balok Baja I-WF</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Pengecekan kapasitas momen, geser, dan lendutan balok baja (simply supported) menahan beban terpusat di tengah bentang.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Bentang (m)</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{length} m</span>
            </div>
            <input type="range" min={2} max={20} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Panjang bentang bebas balok.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Beban Terpusat (kN)</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{load} kN</span>
            </div>
            <input type="range" min={10} max={200} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full accent-destructive" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Beban titik di tengah bentang balok.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Profil Baja (WF)</label>
            <select value={profile} onChange={(e) => setProfile(e.target.value as any)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value="WF200">WF 200x100 (Ringan)</option>
              <option value="WF300">WF 300x150 (Sedang)</option>
              <option value="WF400">WF 400x200 (Berat)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Mutu Baja</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value as any)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value="BJ37">BJ 37 (Fy = 240 MPa)</option>
              <option value="BJ41">BJ 41 (Fy = 250 MPa)</option>
              <option value="BJ50">BJ 50 (Fy = 290 MPa)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main View */}
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Main Chart Area */}
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-32 pt-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.points}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
              <YAxis domain={[-100, 100]} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />
              <Line type="monotone" dataKey="def" stroke="var(--color-civil-500)" strokeWidth={4} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none flex-wrap justify-end">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Momen Lentur (Mu)</span>
            <span className={cn("font-mono font-bold text-lg", result.maxMomen > result.phiMn ? "text-destructive" : "text-[var(--color-foreground)]")}>
              {result.maxMomen.toFixed(1)} <span className="text-xs text-[var(--color-muted-foreground)]">/ {result.phiMn.toFixed(1)}</span>
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Gaya Geser (Vu)</span>
            <span className={cn("font-mono font-bold text-lg", result.maxGeser > result.phiVn ? "text-destructive" : "text-[var(--color-foreground)]")}>
              {result.maxGeser.toFixed(1)} <span className="text-xs text-[var(--color-muted-foreground)]">/ {result.phiVn.toFixed(1)}</span>
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Lendutan Aktual</span>
            <span className={cn("font-mono font-bold text-lg", result.maxDeflection > result.limitDeflection ? "text-destructive" : "text-[var(--color-foreground)]")}>
              {result.maxDeflection.toFixed(1)} <span className="text-xs text-[var(--color-muted-foreground)]">/ {result.limitDeflection.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* HUD Status - Floating Bottom */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={result.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 backdrop-blur-md",
              result.status === "danger" ? "border-l-destructive bg-destructive/10 dark:bg-destructive/20" : 
              result.status === "warning" ? "border-l-warning bg-warning/10 dark:bg-warning/20" : "border-l-safe bg-safe/10 dark:bg-safe/20"
            )}
          >
            <div className={cn(
              "p-2 rounded-full",
              result.status === "danger" ? "bg-destructive/20 text-destructive" : 
              result.status === "warning" ? "bg-warning/20 text-warning" : "bg-safe/20 text-safe"
            )}>
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Struktur Aman" : "Peringatan Struktur"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
