import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

interface BentoCardProps {
  icon: React.ElementType
  title: string
  description: string
  path: string
  size?: "small" | "medium" | "large"
  className?: string
  delay?: number
}

export function BentoCard({ 
  icon: Icon, 
  title, 
  description, 
  path, 
  size = "medium", 
  className,
  delay = 0
}: BentoCardProps) {
  const navigate = useNavigate()

  // Kolom grid span berdasarkan ukuran (Bento style)
  const sizeClasses = {
    small: "md:col-span-1 md:row-span-1",
    medium: "md:col-span-2 md:row-span-1",
    large: "md:col-span-2 md:row-span-2 lg:col-span-3",
  }

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
      {/* Background glow pattern on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-civil-500 to-transparent pointer-events-none" />
      
      {/* Top section: Icon & Arrow */}
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-foreground)] group-hover:bg-civil-500 group-hover:text-white transition-colors duration-300">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
          <ArrowUpRight size={20} strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <div className="mt-auto relative z-10">
        <h3 className="text-lg font-semibold font-[var(--font-display)] text-[var(--color-card-foreground)] mb-2 tracking-tight group-hover:text-civil-600 dark:group-hover:text-civil-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed max-w-[90%]">
          {description}
        </p>
      </div>

      {/* Glass gradient overlay at bottom for large cards if text overflows */}
      {size === "large" && (
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[var(--color-card)] to-transparent opacity-0 group-hover:opacity-0 transition-opacity pointer-events-none" />
      )}
    </motion.button>
  )
}
