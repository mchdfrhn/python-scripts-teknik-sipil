import { NavLink } from "react-router-dom"
import { MODULES } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--color-border)] bg-[var(--color-background)]/50 backdrop-blur-md h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-3 px-2">
          Modul Simulasi
        </h3>
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-2",
                isActive
                  ? "bg-civil-500/10 text-civil-600 dark:text-civil-400"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                <span className="truncate">Beranda Dashboard</span>
              </>
            )}
          </NavLink>

          {MODULES.map((mod) => (
            <NavLink
              key={mod.id}
              to={mod.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-civil-500/10 text-civil-600 dark:text-civil-400"
                    : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <mod.icon 
                    size={18} 
                    className={cn(
                      "transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} 
                  />
                  <span className="truncate">{mod.shortTitle}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
