import { Outlet } from "react-router-dom"
import { AppNavbar } from "./AppNavbar"
import { AppSidebar } from "./AppSidebar"
import { useTheme } from "@/hooks/useTheme"

export function AppLayout() {
  const { isDark, toggle } = useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] transition-colors selection:bg-civil-500/30">
      {/* Top Navigation */}
      <AppNavbar isDark={isDark} onToggleTheme={toggle} />

      {/* Main Layout Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <AppSidebar />

        {/* Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
