import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "safe" | "warning" | "danger"
  children: React.ReactNode
  className?: string
}

const badgeStyles = {
  safe: "bg-safe/10 border-safe/30 text-safe",
  warning: "bg-warning/10 border-warning/30 text-warning",
  danger: "bg-danger/10 border-danger/30 text-danger",
}

const iconMap = {
  safe: "✅",
  warning: "⚠️",
  danger: "🚨",
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-medium leading-relaxed",
        badgeStyles[status],
        className
      )}
    >
      <span className="mr-1.5">{iconMap[status]}</span>
      {children}
    </div>
  )
}
