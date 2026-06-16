import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { EarthquakeSim } from "@/pages/EarthquakeSim"
import { SimPlaceholder } from "@/pages/SimPlaceholder"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/earthquake" element={<EarthquakeSim />} />
          <Route
            path="/steel-beam"
            element={
              <SimPlaceholder
                icon="🌉"
                title="Kelenturan Jembatan & Balok"
                description="Simulasikan seberapa melengkung jembatan atau balok baja ketika dilewati kendaraan atau beban berat."
              />
            }
          />
          <Route
            path="/wind-load"
            element={
              <SimPlaceholder
                icon="💨"
                title="Kekuatan Gedung Menahan Angin"
                description="Hitung seberapa kuat dinding dan kaca gedung bertingkat dalam menahan tiupan angin kencang."
              />
            }
          />
          <Route
            path="/concrete"
            element={
              <SimPlaceholder
                icon="🧪"
                title="Peracik Beton Ramah Lingkungan"
                description="Racik beton yang kokoh namun rendah emisi karbon dengan memanfaatkan abu limbah batubara."
              />
            }
          />
          <Route
            path="/scheduling"
            element={
              <SimPlaceholder
                icon="📅"
                title="Penjadwalan Proyek Konstruksi"
                description="Belajar menyusun jadwal kerja pembangunan rumah agar selesai tepat waktu."
              />
            }
          />
          <Route
            path="/soil-bearing"
            element={
              <SimPlaceholder
                icon="🪨"
                title="Kekuatan Tanah Pondasi"
                description="Uji apakah tanah di bawah rumah Anda cukup kuat menahan berat bangunan."
              />
            }
          />
          <Route
            path="/retaining-wall"
            element={
              <SimPlaceholder
                icon="🧱"
                title="Dinding Penahan Tebing"
                description="Simulasikan kekuatan dinding beton dalam menahan tekanan tanah tebing."
              />
            }
          />
          <Route
            path="/hydrology"
            element={
              <SimPlaceholder
                icon="🌊"
                title="Bendungan Penangkal Banjir"
                description="Lihat bagaimana bendungan menampung air hujan deras agar kota hilir bebas banjir."
              />
            }
          />
          <Route
            path="/pipe-flow"
            element={
              <SimPlaceholder
                icon="🚰"
                title="Tekanan Air Pipa Rumah"
                description="Temukan alasan mengapa air keran bisa mengecil akibat panjang pipa dan banyaknya belokan."
              />
            }
          />
          <Route
            path="/traffic"
            element={
              <SimPlaceholder
                icon="🚦"
                title="Kalkulator Kemacetan Jalan"
                description="Uji kapasitas jalan raya berdasarkan jumlah mobil yang lewat."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
