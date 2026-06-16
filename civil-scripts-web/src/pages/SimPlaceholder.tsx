import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Construction } from "lucide-react"

interface PlaceholderProps {
  icon: string // We'll keep it as string for now, but maybe it should be an Icon component. Actually, wait. I changed constants to use Lucide React components, but App.tsx passes strings to SimPlaceholder right now. I should fix App.tsx or SimPlaceholder.
}

export function SimPlaceholder({ title, description }: { title: string, description: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-2xl bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-muted-foreground)] mb-2"
      >
        <Construction size={40} strokeWidth={1.5} />
      </motion.div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-[var(--font-display)] text-[var(--color-foreground)] tracking-tight">
          {title}
        </h1>
        <p className="text-base text-[var(--color-muted-foreground)] max-w-md mx-auto">
          {description}
        </p>
      </div>

      <div className="rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] px-6 py-4 text-sm font-medium text-[var(--color-foreground)] max-w-sm">
        <div className="flex items-center gap-2 mb-1 justify-center text-civil-500">
          <Construction size={18} />
          <span>Under Construction</span>
        </div>
        <p className="text-[var(--color-muted-foreground)]">Modul ini sedang dipindahkan ke arsitektur React PRO MAX.</p>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-4 px-6 py-3 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </button>
    </div>
  )
}
