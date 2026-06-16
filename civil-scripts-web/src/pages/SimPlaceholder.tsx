import { useNavigate } from "react-router-dom"

interface PlaceholderProps {
  icon: string
  title: string
  description: string
}

export function SimPlaceholder({ icon, title, description }: PlaceholderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <span className="text-6xl">{icon}</span>
      <h1 className="text-2xl font-bold font-[var(--font-display)] text-[var(--color-text)]">
        {title}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md">
        {description}
      </p>
      <div className="rounded-[var(--radius-lg)] bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-warning font-medium">
        🚧 Modul ini sedang dalam proses pengembangan. Segera hadir!
      </div>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-2.5 rounded-[var(--radius-lg)] bg-civil-500 text-white text-sm font-semibold hover:bg-civil-600 transition-colors"
      >
        ← Kembali ke Dashboard
      </button>
    </div>
  )
}
