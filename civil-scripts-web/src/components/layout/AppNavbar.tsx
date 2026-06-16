import { NavLink } from "react-router-dom"
import { MODULES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Moon, Sun, Menu, X, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface NavbarProps {
  isDark: boolean
  onToggleTheme: () => void
}

export function AppNavbar({ isDark, onToggleTheme }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-civil-500 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-md shadow-civil-500/20">
                C
              </div>
              <span className="font-[var(--font-display)] font-bold text-lg tracking-tight hidden sm:block text-[var(--color-foreground)]">
                My Civil Tools<span className="text-civil-500">.</span>
              </span>
            </NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? "dark" : "light"}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* GitHub Link or External CTA */}
            <a 
              href="https://github.com/mchdfrhn/python-scripts-teknik-sipil" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity"
            >
              Repository <ArrowUpRight size={16} />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--color-foreground)]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 p-4 md:hidden glass-panel border-b border-[var(--color-border)] shadow-xl"
          >
            <nav className="flex flex-col gap-2">
              <NavLink 
                to="/" 
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium",
                  isActive ? "bg-civil-500/10 text-civil-600 dark:text-civil-400" : "bg-[var(--color-secondary)] text-[var(--color-foreground)]"
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Beranda Dashboard
              </NavLink>
              <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-2">
                  Semua Modul
                </p>
                {MODULES.map(mod => (
                  <NavLink
                    key={mod.id}
                    to={mod.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-civil-500/10 text-civil-600 dark:text-civil-400 font-medium"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                    )}
                  >
                    <mod.icon size={18} />
                    {mod.title}
                  </NavLink>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
