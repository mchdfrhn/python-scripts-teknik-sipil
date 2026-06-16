import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { CATEGORIES } from "@/lib/constants"

interface BentoCardProps {
  icon: React.ElementType
  title: string
  description: string
  path: string
  category: string
  size?: "small" | "medium" | "large"
  className?: string
  delay?: number
}

// Background patterns to make cards less plain
const getBackgroundPattern = (colorTheme: string) => {
  switch (colorTheme) {
    case "blue":
      return "radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)"
    case "emerald":
      return "radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 60%), radial-gradient(circle at 10% 10%, rgba(52, 211, 153, 0.05) 0%, transparent 40%)"
    case "amber":
      return "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.05) 0%, transparent 40%)"
    case "cyan":
      return "radial-gradient(circle at 0% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 50%, rgba(34, 211, 238, 0.05) 0%, transparent 40%)"
    default:
      return "none"
  }
}

export function BentoCard({ 
  icon: Icon, 
  title, 
  description, 
  path, 
  category,
  size = "medium", 
  className,
  delay = 0
}: BentoCardProps) {
  const navigate = useNavigate()

  const sizeClasses = {
    small: "md:col-span-1 md:row-span-1",
    medium: "md:col-span-2 md:row-span-1",
    large: "md:col-span-2 md:row-span-2 lg:col-span-3",
  }

  // Cari tema warna dari kategori
  const catTheme = CATEGORIES.find(c => c.id === category)?.color || "blue"

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(path)}
      className={cn(
        "group relative flex flex-col text-left overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-card)] border border-[var(--color-border)] p-6 bento-hover",
        sizeClasses[size],
        className
      )}
    >
      {/* Dynamic Background Pattern */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-500 opacity-50 group-hover:opacity-100"
        style={{ background: getBackgroundPattern(catTheme) }}
      />
      
      {/* Grid texture overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(var(--color-foreground) 1px, transparent 0)", backgroundSize: "16px 16px" }} />

      {/* Top section: Icon & Arrow */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-foreground)] group-hover:bg-[var(--color-foreground)] group-hover:text-[var(--color-background)] shadow-sm transition-all duration-300">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 bg-[var(--color-background)]/50 backdrop-blur-sm p-2 rounded-full">
          <ArrowUpRight size={20} strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <div className="mt-auto relative z-10 pt-4">
        <h3 className="text-lg font-semibold font-[var(--font-display)] text-[var(--color-card-foreground)] mb-2 tracking-tight group-hover:text-civil-600 dark:group-hover:text-civil-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed max-w-[95%]">
          {description}
        </p>
      </div>

      {/* Glass gradient overlay at bottom for large cards if text overflows */}
      {size === "large" && (
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[var(--color-card)] to-transparent opacity-100 z-0" />
      )}
    </motion.button>
  )
}
