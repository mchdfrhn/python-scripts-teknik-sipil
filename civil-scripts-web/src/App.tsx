import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { EarthquakeSim } from "@/pages/EarthquakeSim"
import { SteelBeamSim } from "@/pages/SteelBeamSim"
import { WindLoadSim } from "@/pages/WindLoadSim"
import { ConcreteSim } from "@/pages/ConcreteSim"
import { SchedulingSim } from "@/pages/SchedulingSim"
import { SoilBearingSim } from "@/pages/SoilBearingSim"
import { RetainingWallSim } from "@/pages/RetainingWallSim"
import { HydrologySim } from "@/pages/HydrologySim"
import { PipeFlowSim } from "@/pages/PipeFlowSim"
import { TrafficSim } from "@/pages/TrafficSim"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
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
