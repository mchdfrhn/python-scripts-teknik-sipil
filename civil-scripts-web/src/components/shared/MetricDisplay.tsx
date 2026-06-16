import { cn } from "@/lib/utils"

interface MetricDisplayProps {
  label: string
  value: string | number
  unit?: string
  status?: "safe" | "warning" | "danger" | "neutral"
  helpText?: string
  delta?: { value: number; label: string }
}

const statusColors = {
  safe: "border-safe/30 bg-safe/5",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-danger/30 bg-danger/5",
  neutral: "border-[var(--color-border)] bg-[var(--color-surface-card)]",
}

const statusTextColors = {
  safe: "text-safe",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-[var(--color-text)]",
}

export function MetricDisplay({
  label,
  value,
  unit,
  status = "neutral",
  helpText,
  delta,
}: MetricDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 transition-all duration-200",
        statusColors[status]
      )}
      title={helpText}
    >
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1 truncate">
        {label}
      </p>
      <p className={cn("text-2xl font-bold tabular-nums", statusTextColors[status])}>
        {typeof value === "number" ? value.toFixed(1) : value}
        {unit && (
          <span className="text-sm font-medium text-[var(--color-text-muted)] ml-1">
            {unit}
          </span>
        )}
      </p>
      {delta && (
        <p
          className={cn(
            "text-xs font-medium mt-1",
            delta.value < 0 ? "text-safe" : delta.value > 0 ? "text-danger" : "text-[var(--color-text-muted)]"
          )}
        >
          {delta.value > 0 ? "+" : ""}
          {delta.value.toFixed(1)}% {delta.label}
        </p>
      )}
    </div>
  )
}
