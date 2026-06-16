import { BrowserRouter, Routes, Route } from "react-router-dom"
import { lazy } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Dashboard } from "@/pages/Dashboard"

// Lazy load heavy physics simulator pages to enable code-splitting and loading UI
const EarthquakeSim = lazy(() => import("@/pages/EarthquakeSim").then(module => ({ default: module.EarthquakeSim })))
const SteelBeamSim = lazy(() => import("@/pages/SteelBeamSim").then(module => ({ default: module.SteelBeamSim })))
const WindLoadSim = lazy(() => import("@/pages/WindLoadSim").then(module => ({ default: module.WindLoadSim })))
const ConcreteSim = lazy(() => import("@/pages/ConcreteSim").then(module => ({ default: module.ConcreteSim })))
const SchedulingSim = lazy(() => import("@/pages/SchedulingSim").then(module => ({ default: module.SchedulingSim })))
const SoilBearingSim = lazy(() => import("@/pages/SoilBearingSim").then(module => ({ default: module.SoilBearingSim })))
const RetainingWallSim = lazy(() => import("@/pages/RetainingWallSim").then(module => ({ default: module.RetainingWallSim })))
const HydrologySim = lazy(() => import("@/pages/HydrologySim").then(module => ({ default: module.HydrologySim })))
const PipeFlowSim = lazy(() => import("@/pages/PipeFlowSim").then(module => ({ default: module.PipeFlowSim })))
const TrafficSim = lazy(() => import("@/pages/TrafficSim").then(module => ({ default: module.TrafficSim })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Dashboard is not lazy loaded so it appears instantly */}
          <Route index element={<Dashboard />} />
          <Route path="/earthquake" element={<EarthquakeSim />} />
          <Route path="/steel-beam" element={<SteelBeamSim />} />
          <Route path="/wind-load" element={<WindLoadSim />} />
          <Route path="/concrete" element={<ConcreteSim />} />
          <Route path="/scheduling" element={<SchedulingSim />} />
          <Route path="/soil-bearing" element={<SoilBearingSim />} />
          <Route path="/retaining-wall" element={<RetainingWallSim />} />
          <Route path="/hydrology" element={<HydrologySim />} />
          <Route path="/pipe-flow" element={<PipeFlowSim />} />
          <Route path="/traffic" element={<TrafficSim />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
