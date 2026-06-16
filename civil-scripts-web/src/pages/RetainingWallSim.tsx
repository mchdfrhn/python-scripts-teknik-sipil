import { useState, useMemo } from "react"
import { calculateRetainingWall } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function RetainingWallSim() {
  const [height, setHeight] = useState(5)
  const [soilType, setSoilType] = useState<"pasir" | "lempung">("pasir")

  const result = useMemo(() => calculateRetainingWall(height, soilType), [height, soilType])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)]"><h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis SNI 8460</h2></div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-3"><div className="flex justify-between"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">TINGGI DINDING (m)</label><span className="text-sm font-bold">{height}m</span></div><input type="range" min={2} max={10} step={0.5} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-civil-500" /></div>
          <div className="space-y-3"><label className="text-xs font-semibold text-[var(--color-muted-foreground)]">JENIS TANAH</label><select value={soilType} onChange={(e) => setSoilType(e.target.value as "pasir" | "lempung")} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)]"><option value="pasir">Pasir (Sifat Geser Baik)</option><option value="lempung">Lempung (Berpotensi Mengembang)</option></select></div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Simple visual representation */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 pt-16 pb-32">
          <div className="relative flex-1 w-full max-w-2xl border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] shadow-sm flex items-end justify-center pb-12 overflow-hidden">
            {/* Soil */}
            <div className="absolute right-0 bottom-0 h-1/2 w-1/2 bg-amber-900/20 dark:bg-amber-900/40 rounded-tl-xl border-t border-l border-amber-900/30">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) 1px, transparent 0, transparent 10px)', backgroundSize: '15px 15px' }} />
            </div>

            <div className="relative flex items-end">
              {/* Wall */}
              <motion.div 
                className="bg-zinc-400 dark:bg-zinc-600 rounded-sm origin-bottom-right z-10"
                animate={{ 
                  height: height * 40,
                  width: 40,
                  rotate: result.status === 'danger' ? -15 : 0 // Tipping animation if dangerous
                }}
                transition={{ type: "spring" }}
              />
              {/* Base Footing */}
              <motion.div 
                className="bg-zinc-400 dark:bg-zinc-600 rounded-sm absolute bottom-0 right-0 z-10 origin-bottom-right"
                animate={{ 
                  width: result.baseWidth * 40 + 40, 
                  height: 30,
                  rotate: result.status === 'danger' ? -15 : 0
                }}
                transition={{ type: "spring" }}
              />
              
              {/* Force arrow */}
              <motion.div 
                className="absolute right-[-40px] border-b-4 border-l-4 border-destructive w-16 h-4 z-20"
                animate={{ top: height * 40 * 0.6 }} // Acting at H/3 from bottom
              />
            </div>
            <div className="absolute bottom-12 w-full h-1 bg-[var(--color-border)]" />
          </div>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none flex-wrap justify-end">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">SF Guling</span>
            <span className={cn("font-mono font-bold text-lg", result.SF_overturning >= 1.5 ? "text-safe" : "text-destructive")}>
              {result.SF_overturning.toFixed(2)}
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">SF Geser</span>
            <span className={cn("font-mono font-bold text-lg", result.SF_sliding >= 1.5 ? "text-safe" : "text-destructive")}>
              {result.SF_sliding.toFixed(2)}
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
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 bg-[var(--color-background)]/90 backdrop-blur-md",
              result.status === "danger" ? "border-l-destructive" : 
              result.status === "warning" ? "border-l-warning" : "border-l-safe"
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Dinding Stabil" : "Peringatan Stabilitas"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
