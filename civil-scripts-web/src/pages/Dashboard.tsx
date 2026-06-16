import { SimulatorCard } from "@/components/shared/SimulatorCard"
import { MODULES, CATEGORIES } from "@/lib/constants"

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="text-center lg:text-left space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-display)] gradient-text">
          Civil Scripts Hub
        </h1>
        <p className="text-base text-[var(--color-text-muted)] max-w-2xl">
          Pusat Edukasi & Simulasi Interaktif Rekayasa Teknik Sipil untuk Masyarakat Awam.
          Pilih salah satu modul di bawah untuk memulai simulasi.
        </p>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((cat) => {
        const catModules = MODULES.filter((m) => m.category === cat.id)
        if (catModules.length === 0) return null

        return (
          <section key={cat.id} className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2 border-l-4 border-civil-500 pl-3">
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catModules.map((mod) => (
                <SimulatorCard
                  key={mod.id}
                  icon={mod.icon}
                  title={mod.title}
                  description={mod.description}
                  path={mod.path}
                />
              ))}
            </div>
          </section>
        )
      })}

      {/* Footer info */}
      <div className="rounded-[var(--radius-lg)] border border-civil-500/20 bg-civil-500/5 px-4 py-3 text-sm text-civil-600 dark:text-civil-400">
        ℹ️ Pilih menu navigasi sidebar di sebelah kiri atau klik kartu di atas untuk membuka modul simulator.
      </div>
    </div>
  )
}
