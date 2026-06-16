import { Outlet, useLocation } from "react-router-dom"
import { AppNavbar } from "./AppNavbar"
import { AppSidebar } from "./AppSidebar"
import { useTheme } from "@/hooks/useTheme"
import { AnimatePresence, motion } from "framer-motion"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export function AppLayout() {
  const { isDark, toggle } = useTheme()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] transition-colors selection:bg-civil-500/30">
      {/* Top Navigation */}
      <AppNavbar isDark={isDark} onToggleTheme={toggle} />

      {/* Main Layout Area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <AppSidebar />

        {/* Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Suspense 
                fallback={
                  <div className="absolute inset-0 flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-civil-500 mb-4" />
                    <p className="text-sm text-[var(--color-muted-foreground)] animate-pulse font-medium">Memuat Modul Simulasi...</p>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
