import { useState, useMemo } from "react"
import { calculateWindLoad } from "@/lib/physics/models"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function WindLoadSim() {
  const [height, setHeight] = useState(50)
  const [windSpeed, setWindSpeed] = useState(30)
  const [exposure, setExposure] = useState<"B" | "C" | "D">("B")

  const result = useMemo(() => calculateWindLoad(windSpeed, height, exposure), [height, windSpeed, exposure])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis SNI 1727</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Beban Angin pada Bangunan</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung distribusi tekanan angin berdasarkan ketinggian gedung dan kategori eksposur lingkungan.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30">METODE: SNI 1727:2020</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Tinggi Gedung</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{height} m</span>
            </div>
            <input type="range" min={10} max={200} step={5} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Ketinggian struktur dari permukaan tanah.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Kec. Angin Dasar</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{windSpeed} m/s</span>
            </div>
            <input type="range" min={20} max={80} value={windSpeed} onChange={(e) => setWindSpeed(Number(e.target.value))} className="w-full accent-destructive" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Kecepatan angin rencana (basic wind speed).</p>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Kategori Eksposur</label>
            <select value={exposure} onChange={(e) => setExposure(e.target.value as "B" | "C" | "D")} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value="B">Eksposur B (Perkotaan / Padat)</option>
              <option value="C">Eksposur C (Terbuka / Dataran)</option>
              <option value="D">Eksposur D (Tepi Pantai / Laut)</option>
            </select>
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Main Chart Area */}
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-32 pt-32 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.pressureList} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" />
              <YAxis dataKey="z" type="category" stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Bar dataKey="p" fill="var(--color-civil-500)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Tekanan Angin Maks (qz)</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {result.maxPressure.toFixed(0)} Pa
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg hidden xl:flex gap-4 items-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">α (Alpha)</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.alpha.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Zg (Gradien)</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.zg.toFixed(2)} m</span>
            </div>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Fasad Aman" : "Peringatan Beban Angin"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
