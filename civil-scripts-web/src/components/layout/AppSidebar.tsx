import { NavLink } from "react-router-dom"
import { MODULES, CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Moon, Sun, X } from "lucide-react"

interface SidebarProps {
  isDark: boolean
  onToggleTheme: () => void
  isOpen: boolean
  onClose: () => void
}

export function AppSidebar({ isDark, onToggleTheme, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 glass flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
          <NavLink to="/" className="flex items-center gap-2.5 no-underline" onClick={onClose}>
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="text-base font-bold font-[var(--font-display)] gradient-text leading-tight">
                Civil Scripts Hub
              </h1>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                Simulasi Teknik Sipil
              </p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {cat.label}
              </p>
              <div className="space-y-0.5">
                {MODULES.filter((m) => m.category === cat.id).map((mod) => (
                  <NavLink
                    key={mod.id}
                    to={mod.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all duration-200 no-underline",
                        isActive
                          ? "bg-civil-500/10 text-civil-600 dark:text-civil-400 shadow-sm"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)]"
                      )
                    }
                  >
                    <span className="text-lg flex-shrink-0">{mod.icon}</span>
                    <span className="truncate">{mod.shortTitle}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: theme toggle */}
        <div className="px-4 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)] transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
