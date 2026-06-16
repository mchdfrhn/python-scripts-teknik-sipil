import { useState, useMemo } from "react"
import { calculatePipeFlow } from "@/lib/physics/models"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function PipeFlowSim() {
  const [length, setLength] = useState(50)
  const [diameter, setDiameter] = useState(25) // mm

  const result = useMemo(() => calculatePipeFlow(length, diameter), [length, diameter])

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Parameter Perpipaan</h2>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Persamaan Hazen-Williams</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Mensimulasikan kehilangan tinggi tekan (head loss) akibat gesekan di sepanjang pipa PVC tertutup.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Panjang Pipa</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{length} m</span>
            </div>
            <input type="range" min={10} max={200} step={10} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Jarak lintasan pipa dari sumber ke titik pemakaian.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Diameter Pipa</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{diameter} mm</span>
            </div>
            <input type="range" min={12} max={100} value={diameter} onChange={(e) => setDiameter(Number(e.target.value))} className="w-full accent-civil-500" />
            <p className="text-xs text-[var(--color-muted-foreground)]">Ukuran penampang dalam pipa.</p>
          </div>
        </div>
      </motion.div>
      <div className="relative flex-1 bg-[var(--color-background)]">
        
        {/* Main Chart Area */}
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-40 pt-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.profile}>
              <defs>
                <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-civil-500)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-civil-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="distance" stroke="var(--color-muted-foreground)" />
              <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="pressure" stroke="var(--color-civil-500)" fillOpacity={1} fill="url(#colorPressure)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* HUD Metrics - Floating Top Right */}
        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Head Loss</span>
            <span className="font-mono font-bold text-lg text-[var(--color-foreground)]">
              {result.headLoss.toFixed(1)} m
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Tekanan Sisa</span>
            <span className={cn("font-mono font-bold text-lg", result.status === "danger" ? "text-destructive" : result.status === "warning" ? "text-warning" : "text-safe")}>
              {Math.max(0, result.finalPressure).toFixed(1)} m
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg hidden xl:flex gap-4 items-end">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Kekasaran Pipa (C)</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{result.C} (PVC)</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase">Debit (Q)</span>
              <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{(result.Q * 1000).toFixed(1)} L/s</span>
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
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Status Aman" : "Peringatan Aliran"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
