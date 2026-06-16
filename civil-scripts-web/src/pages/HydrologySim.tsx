import { MethodModal } from "@/components/shared/MethodModal"
import { useState, useMemo } from "react"
import { calculateHydrology } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function HydrologySim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [rainIntensity, setRainIntensity] = useState(100)
  const [area, setArea] = useState(10)
  const [runoffCoef, setRunoffCoef] = useState(0.7)

  const result = useMemo(() => calculateHydrology(rainIntensity, area, runoffCoef), [rainIntensity, area, runoffCoef])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis SNI 2415</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Analisis Debit Puncak (Metode Rasional)</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung Debit Limpasan (Runoff) maksimal akibat intensitas curah hujan berdasarkan Metode Rasional.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: RASIONAL (Q = C.I.A)</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Intensitas Hujan</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{rainIntensity} mm/j</span>
            </div>
            <input type="range" min={20} max={300} value={rainIntensity} onChange={(e) => setRainIntensity(Number(e.target.value))} className="w-full accent-destructive" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Curah hujan maksimum pada suatu durasi tertentu.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Luas DAS</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{area} km²</span>
            </div>
            <input type="range" min={1} max={50} value={area} onChange={(e) => setArea(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Luas Daerah Aliran Sungai yang menampung hujan.</p>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Tutupan Lahan (C)</label>
            <select value={runoffCoef} onChange={(e) => setRunoffCoef(Number(e.target.value))} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              <option value={0.9}>0.90 - Perkotaan / Aspal Padat</option>
              <option value={0.7}>0.70 - Permukiman / Perumahan</option>
              <option value={0.3}>0.30 - Lahan Kosong / Pertanian</option>
              <option value={0.1}>0.10 - Hutan Lebat</option>
            </select>
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Main Chart Area */}
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-40 pt-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.hydrograph}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="discharge" name="Debit Aliran (Q)" stroke="var(--color-destructive)" fill="var(--color-destructive)" fillOpacity={0.2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Total Vol. Limpasan</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">
              {(result.totalVolumeM3 / 1000).toFixed(1)}k m³
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Debit Puncak (Q)</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {result.peakDischarge.toFixed(1)} m³/s
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg hidden xl:flex gap-4 items-end">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Rumus Rasional</span>
               <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">0.278 × C × I × A</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Faktor Konversi</span>
               <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">0.278</span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Kondisi Aman" : "Peringatan Banjir"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="hydrology" />
      </div>
  )
}
