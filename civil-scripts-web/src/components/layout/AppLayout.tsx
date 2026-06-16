import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"
import { useTheme } from "@/hooks/useTheme"
import { Menu } from "lucide-react"

export function AppLayout() {
  const { isDark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--color-surface-dim)] transition-colors">
      <AppSidebar
        isDark={isDark}
        onToggleTheme={toggle}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
        >
          <Menu size={20} />
        </button>
        <span className="text-lg">🏛️</span>
        <span className="font-bold text-sm gradient-text">Civil Scripts Hub</span>
      </div>

      {/* Main content area */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
