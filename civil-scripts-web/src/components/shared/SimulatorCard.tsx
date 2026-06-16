import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface SimulatorCardProps {
  icon: string
  title: string
  description: string
  path: string
  className?: string
}

export function SimulatorCard({ icon, title, description, path, className }: SimulatorCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "group relative w-full text-left rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-5 transition-all duration-300",
        "hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-civil-500/30",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civil-500",
        className
      )}
    >
      {/* Icon */}
      <span className="text-3xl block mb-3 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>

      {/* Title */}
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1.5 leading-snug">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Hover arrow indicator */}
      <div className="absolute top-5 right-5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3l5 5-5 5" />
        </svg>
      </div>
    </button>
  )
}
