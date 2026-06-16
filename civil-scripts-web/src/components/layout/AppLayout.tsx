import { Outlet } from "react-router-dom"
import { AppNavbar } from "./AppNavbar"
import { useTheme } from "@/hooks/useTheme"

export function AppLayout() {
  const { isDark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors selection:bg-civil-500/30">
      <AppNavbar isDark={isDark} onToggleTheme={toggle} />

      {/* Main content area */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
