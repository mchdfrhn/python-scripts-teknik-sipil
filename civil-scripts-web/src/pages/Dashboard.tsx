import { BentoCard } from "@/components/shared/BentoCard"
import { MODULES } from "@/lib/constants"
import { motion } from "framer-motion"
import { Activity } from "lucide-react"

export function Dashboard() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative pt-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civil-500/10 text-civil-600 dark:text-civil-400 text-xs font-semibold mb-2">
            <Activity size={14} className="animate-pulse" />
            Vite Engine 60 FPS
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-[var(--font-display)] tracking-tight leading-[1.1]">
            Simulasi <span className="gradient-text-pro">Teknik Sipil</span><br /> 
            dalam Genggaman Anda.
          </h1>
          <p className="text-base md:text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
            Tinggalkan tabel dan grafik statis. Eksplorasi tools interaktif yang mensimulasikan hukum fisika konstruksi secara real-time—dari gedung pencakar langit hingga mekanika tanah.
          </p>
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[minmax(200px,auto)]">
          {MODULES.map((mod, idx) => (
            <BentoCard
              key={mod.id}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              path={mod.path}
              category={mod.category}
              size={mod.size as "small" | "medium" | "large"}
              delay={0.1 + (idx * 0.05)} // Stagger effect
            />
          ))}
        </div>
      </section>
    </div>
  )
}
