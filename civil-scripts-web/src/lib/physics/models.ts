// Physics engine for remaining 9 modules

// ==========================================
// 1. STEEL BEAM (Kelenturan Balok & Jembatan)
// ==========================================
export function calculateBeam(length: number, load: number, profile: "IWF" | "HBeam" | "Hollow") {
  // Simplified calculation for simply supported beam with point load at center
  const E = 200000 // MPa
  let I = 50000000 // mm^4
  if (profile === "HBeam") I = 80000000
  if (profile === "Hollow") I = 20000000

  const L_mm = length * 1000
  const maxMomen = (load * length) / 4 // kNm
  const maxGeser = load / 2 // kN
  const maxDeflection = (load * 1000 * Math.pow(L_mm, 3)) / (48 * E * I) // mm

  const points = []
  for (let x = 0; x <= length; x += 0.5) {
    const sfd = x < length / 2 ? maxGeser : -maxGeser
    const bmd = x <= length / 2 ? (load / 2) * x : (load / 2) * (length - x)
    // Deflection curve for point load at center
    let def = 0
    const x_mm = x * 1000
    if (x_mm <= L_mm / 2) {
      def = ((load * 1000 * x_mm) / (48 * E * I)) * (3 * L_mm * L_mm - 4 * x_mm * x_mm)
    } else {
      const x_prime = L_mm - x_mm
      def = ((load * 1000 * x_prime) / (48 * E * I)) * (3 * L_mm * L_mm - 4 * x_prime * x_prime)
    }
    points.push({ x, sfd, bmd, def: -def }) // def negative means downward
  }

  let status = "safe"
  let msg = "Lendutan balok masih dalam batas aman."
  const limit = L_mm / 360
  if (maxDeflection > limit) {
    status = "danger"
    msg = `BAHAYA: Balok melengkung terlalu tajam (${maxDeflection.toFixed(1)}mm > Batas ${limit.toFixed(1)}mm).`
  } else if (maxDeflection > limit * 0.8) {
    status = "warning"
    msg = `WASPADA: Lendutan balok mendekati batas izin.`
  }

  return { maxMomen, maxGeser, maxDeflection, points, status, msg }
}

// ==========================================
// 2. WIND LOAD (Kekuatan Gedung Menahan Angin)
// ==========================================
export function calculateWindLoad(height: number, windSpeed: number, location: "kota" | "pantai") {
  const Kzt = 1.0, Kd = 0.85, G = 0.85
  const KzList = []
  const pressureList = []
  
  let maxPressure = 0
  for (let z = 0; z <= height; z += 5) {
    // Simplified Kz formula based on ASCE 7
    const alpha = location === "kota" ? 7.0 : 9.5
    const zg = location === "kota" ? 365.76 : 274.32
    const z_eff = Math.max(z, 4.5)
    const Kz = 2.01 * Math.pow((z_eff / zg), (2 / alpha))
    
    // qz in N/m2 (simplified from mph/psf conversions)
    const V_ms = windSpeed * (1000/3600)
    const qz = 0.613 * Kz * Kzt * Kd * Math.pow(V_ms, 2)
    const p = qz * G // Design pressure
    
    KzList.push(Kz)
    pressureList.push({ z, pressure: p })
    maxPressure = Math.max(maxPressure, p)
  }

  let status = "safe"
  let msg = "Ketebalan kaca standar aman digunakan."
  if (maxPressure > 1500) {
    status = "danger"
    msg = `BAHAYA KACA PECAH: Tekanan angin sangat ekstrem (${maxPressure.toFixed(0)} Pa). Wajib gunakan kaca Tempered tebal 12mm+.`
  } else if (maxPressure > 800) {
    status = "warning"
    msg = "TEKANAN TINGGI: Gunakan kaca Laminated minimal 8mm."
  }

  return { pressureList, maxPressure, status, msg }
}

// ==========================================
// 3. CONCRETE (Peracik Beton Ramah Lingkungan)
// ==========================================
export function calculateConcrete(targetStrength: number, flyAshPercent: number) {
  // Simplified mix design model
  const waterBase = 180 // kg/m3
  let cement = 0
  
  if (targetStrength === 20) cement = 300
  else if (targetStrength === 30) cement = 400
  else if (targetStrength === 40) cement = 500

  const flyAshMass = cement * (flyAshPercent / 100)
  const finalCement = cement - flyAshMass
  const w_c = waterBase / (finalCement + flyAshMass)

  // CO2 Emission: ~0.9 kg CO2 per kg Cement, ~0.02 for Fly Ash
  const co2_standard = cement * 0.9
  const co2_eco = (finalCement * 0.9) + (flyAshMass * 0.02)
  const co2_reduction = ((co2_standard - co2_eco) / co2_standard) * 100

  let status = "safe"
  let msg = "Campuran beton optimal dan mudah diaduk."
  if (flyAshPercent > 35) {
    status = "danger"
    msg = "WASPADA: Substitusi abu batubara terlalu banyak. Beton butuh waktu 50+ hari untuk keras sepenuhnya."
  } else if (flyAshPercent > 20) {
    status = "warning"
    msg = "Beton sangat ramah lingkungan, namun butuh pengawasan ekstra saat pengecoran."
  }

  return { w_c, finalCement, flyAshMass, co2_standard, co2_eco, co2_reduction, status, msg }
}

// ==========================================
// 4. SCHEDULING (Jalur Kritis)
// ==========================================
export function calculateSchedule(delay: number) {
  const baseDays = { fondasi: 10, dinding: 15, atap: 7, finishing: 12 }
  // Adding delay to dinding (critical)
  const dinding = baseDays.dinding + delay
  
  const totalDuration = baseDays.fondasi + dinding + baseDays.atap + baseDays.finishing
  
  // Fake tasks for Gantt
  const tasks = [
    { name: "Pekerjaan Fondasi", start: 0, end: baseDays.fondasi, critical: true },
    { name: "Pemasangan Dinding", start: baseDays.fondasi, end: baseDays.fondasi + dinding, critical: true },
    { name: "Instalasi Pipa Air", start: baseDays.fondasi, end: baseDays.fondasi + 8, critical: false }, // slack
    { name: "Rangka & Penutup Atap", start: baseDays.fondasi + dinding, end: baseDays.fondasi + dinding + baseDays.atap, critical: true },
    { name: "Finishing & Cat", start: baseDays.fondasi + dinding + baseDays.atap, end: totalDuration, critical: true },
  ]

  let status = "safe"
  let msg = "Proyek berjalan sesuai rencana waktu."
  if (delay > 5) {
    status = "danger"
    msg = `KETERLAMBATAN KRITIS: Mundurnya pekerjaan dinding membuat seluruh proyek mundur ${delay} hari!`
  } else if (delay > 0) {
    status = "warning"
    msg = `WASPADA: Proyek sedikit meleset dari jadwal awal.`
  }

  return { tasks, totalDuration, status, msg }
}

// ==========================================
// 5. SOIL BEARING (Daya Dukung Tanah)
// ==========================================
export function calculateSoilBearing(width: number, cohesion: number, phi: number) {
  const gamma = 18 // kN/m3
  const Df = 1.0 // m
  
  // Simplified Terzaghi Bearing Capacity Factors
  const Nc = (phi - 10) * 1.5 + 5
  const Nq = Math.exp(Math.PI * Math.tan(phi * Math.PI / 180)) * Math.pow(Math.tan((45 + phi/2) * Math.PI / 180), 2) / 3 // very approx
  const Ng = 1.5 * (Nq - 1) * Math.tan(phi * Math.PI / 180)

  const q_ult = (cohesion * Nc) + (gamma * Df * Nq) + (0.5 * gamma * width * Ng)
  const q_all = q_ult / 3 // Safety Factor = 3

  let status = "safe"
  let msg = "Pondasi sangat aman menahan beban rumah 2 lantai."
  if (q_all < 50) {
    status = "danger"
    msg = "BAHAYA AMBLAS: Tanah terlalu lembek. Harus dipasang tiang pancang (paku bumi)!"
  } else if (q_all < 100) {
    status = "warning"
    msg = "WASPADA: Lebarkan ukuran tapak pondasi agar beban menyebar lebih luas."
  }

  return { q_ult, q_all, status, msg }
}

// ==========================================
// 6. RETAINING WALL (Dinding Penahan Tanah)
// ==========================================
export function calculateRetainingWall(height: number, soilType: "pasir" | "lempung") {
  const gamma = soilType === "pasir" ? 18 : 16
  const phi = soilType === "pasir" ? 30 : 20
  
  // Rankine Active Earth Pressure
  const Ka = Math.pow(Math.tan((45 - phi/2) * Math.PI / 180), 2)
  const Pa = 0.5 * Ka * gamma * height * height // Active force
  
  // Resisting (concrete weight)
  const baseWidth = height * 0.6
  const W_concrete = baseWidth * height * 24 // concrete gamma
  const resistingMoment = W_concrete * (baseWidth / 2)
  const overturningMoment = Pa * (height / 3)
  
  const SF_overturning = resistingMoment / overturningMoment

  let status = "safe"
  let msg = "Dinding penahan tebing sangat kokoh."
  if (SF_overturning < 1.5) {
    status = "danger"
    msg = `BAHAYA LONGSOR: Dinding bisa terguling! (Faktor Keamanan = ${SF_overturning.toFixed(2)} < 1.5). Lebarkan dasar pondasi.`
  } else if (SF_overturning < 2.0) {
    status = "warning"
    msg = "WASPADA: Dinding cukup aman, tapi pertimbangkan sistem drainase agar air hujan tidak menambah beban dorong."
  }

  return { Pa, SF_overturning, baseWidth, status, msg }
}

// ==========================================
// 7. HYDROLOGY (Bendungan Penangkal Banjir)
// ==========================================
export function calculateHydrology(rainIntensity: "ringan" | "sedang" | "lebat", gatesOpen: number) {
  let peakInflow = 50
  if (rainIntensity === "sedang") peakInflow = 150
  if (rainIntensity === "lebat") peakInflow = 300

  const timeHours = Array.from({length: 24}, (_, i) => i)
  const hydrograph = timeHours.map(t => {
    // Fake hydrograph curve
    const inflow = peakInflow * Math.exp(-0.5 * Math.pow((t - 6)/2, 2))
    // Outflow depends on gates
    const maxOutflow = gatesOpen * 40
    let outflow = inflow * 0.6
    if (outflow > maxOutflow) outflow = maxOutflow
    return { hour: t, inflow, outflow, diff: inflow - outflow }
  })

  // Calculate volume stored
  const totalVolumeStored = hydrograph.reduce((sum, h) => sum + (h.inflow - h.outflow > 0 ? h.inflow - h.outflow : 0), 0)

  let status = "safe"
  let msg = "Bendungan berhasil meredam debit air. Kota hilir aman dari banjir."
  if (totalVolumeStored > 400 && gatesOpen < 3) {
    status = "danger"
    msg = "BAHAYA TANGGUL JEBOL: Bendungan kepenuhan (Overtopping)! Segera buka pintu air tambahan!"
  } else if (totalVolumeStored > 250) {
    status = "warning"
    msg = "WASPADA: Permukaan air waduk mendekati batas atas (Siaga 2)."
  }

  return { hydrograph, totalVolumeStored, status, msg }
}

// ==========================================
// 8. PIPE FLOW (Tekanan Air Pipa Rumah)
// ==========================================
export function calculatePipeFlow(length: number, diameter: number) {
  const C = 130 // PVC roughness
  const flowLPM = 20 // 20 Liters per minute
  const Q_m3s = flowLPM / 60000
  const D_m = diameter / 1000

  // Hazen-Williams Head Loss
  const hf = 10.67 * length * Math.pow(Q_m3s, 1.852) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.87))
  
  // Calculate pressure drop profile
  const profile = []
  for (let x = 0; x <= length; x += length/10) {
    const hf_x = 10.67 * x * Math.pow(Q_m3s, 1.852) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.87))
    profile.push({ distance: x, pressure: 10 - hf_x }) // Assuming start at 10m head
  }

  const finalPressure = 10 - hf

  let status = "safe"
  let msg = "Air mengalir sangat deras di ujung keran."
  if (finalPressure < 2) {
    status = "danger"
    msg = `ALIRAN MATI: Air menetes sangat pelan. Pipa terlalu kecil (${diameter}mm) atau terlalu panjang.`
  } else if (finalPressure < 5) {
    status = "warning"
    msg = "ALIRAN LEMAH: Tekanan air berkurang signifikan akibat gesekan dinding pipa."
  }

  return { profile, headLoss: hf, finalPressure, status, msg }
}

// ==========================================
// 9. TRAFFIC (Kemacetan Lalu Lintas)
// ==========================================
export function calculateTraffic(volume: number, lanes: number) {
  // Simple MKJI capacity model
  const capacityPerLane = 1500 // smp/jam
  const totalCapacity = lanes * capacityPerLane
  const vcr = volume / totalCapacity // Volume Capacity Ratio

  let los = "A"
  if (vcr > 1.0) los = "F"
  else if (vcr > 0.85) los = "E"
  else if (vcr > 0.75) los = "D"
  else if (vcr > 0.6) los = "C"
  else if (vcr > 0.4) los = "B"

  let status = "safe"
  let msg = "Jalan lengang, kendaraan bisa ngebut santai."
  if (los === "F") {
    status = "danger"
    msg = "MACET TOTAL (Stuck): Kapasitas jalan tidak muat menampung volume mobil. Perlu tambah lajur."
  } else if (los === "E" || los === "D") {
    status = "warning"
    msg = "PADAT MERAYAP: Kecepatan kendaraan menurun drastis karena jarak antar mobil sangat dekat."
  }

  // Generate fake cars for animation
  const cars = Array.from({length: Math.min(volume/100, 50)}, (_, i) => ({
    id: i,
    speed: Math.max(10, 100 * (1 - vcr)),
    lane: i % lanes
  }))

  return { vcr, los, totalCapacity, cars, status, msg }
}
