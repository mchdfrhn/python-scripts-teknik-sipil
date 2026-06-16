import { useState, useMemo } from "react"
import { calculateSoilBearing } from "@/lib/physics/models"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function SoilBearingSim() {
  const [width, setWidth] = useState(1.0)
  const [cohesion, setCohesion] = useState(20)
  const [phi, setPhi] = useState(15)

  const result = useMemo(() => calculateSoilBearing(width, cohesion, phi), [width, cohesion, phi])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis Meyerhof</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Kapasitas Dukung Tanah</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Menghitung daya dukung ultimit dan izin pondasi dangkal berdasarkan teori Meyerhof.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Lebar Pondasi</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{width.toFixed(1)} m</span>
            </div>
            <input type="range" min={0.5} max={3.0} step={0.1} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Dimensi lebar dasar pondasi.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Kohesi Tanah</label>
              <span className="text-sm font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">{cohesion} kPa</span>
            </div>
            <input type="range" min={0} max={100} value={cohesion} onChange={(e) => setCohesion(Number(e.target.value))} className="w-full accent-amber-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Kekuatan tarik/lekat antar partikel tanah.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Sudut Geser</label>
              <span className="text-sm font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">{phi}°</span>
            </div>
            <input type="range" min={0} max={45} value={phi} onChange={(e) => setPhi(Number(e.target.value))} className="w-full accent-amber-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Sudut gesekan dalam material tanah.</p>
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Simple visual representation */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 pb-40 pt-28">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--color-foreground) 0, var(--color-foreground) 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
          
          <div className="relative flex flex-col items-center">
            {/* Column */}
            <div className="w-8 h-32 bg-[var(--color-muted-foreground)]" />
            {/* Footing */}
            <motion.div 
              className="h-12 bg-civil-500 rounded-sm"
              animate={{ width: width * 100 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
            {/* Ground line */}
            <div className="w-[300px] md:w-[500px] h-1 mt-4 bg-[var(--color-border)]" />
            
            {/* Pressure bulbs (conceptual) */}
            <motion.div 
              className="absolute top-[180px] rounded-[100%] border-2 border-dashed border-amber-500/50"
              animate={{ 
                width: width * 100 * 1.5, 
                height: width * 100,
                opacity: result.status === 'danger' ? 1 : 0.5
              }}
            />
            <motion.div 
              className="absolute top-[180px] rounded-[100%] border-2 border-dashed border-amber-500/30"
              animate={{ 
                width: width * 100 * 2.5, 
                height: width * 100 * 1.8,
              }}
            />
          </div>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Daya Dukung Max</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">
              {result.q_ult.toFixed(1)} kPa
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Daya Dukung Izin</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {result.q_all.toFixed(1)} kPa
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg hidden xl:flex gap-4 items-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Nc</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.Nc.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Nq</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.Nq.toFixed(1)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Nγ</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.Ngamma.toFixed(1)}</span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Pondasi Kuat" : "Peringatan Tanah"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
