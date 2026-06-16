// Physics engine for remaining 9 modules

export type StatusType = "safe" | "warning" | "danger" | "neutral";

// ==========================================
// 1. STEEL BEAM (Kelenturan Balok & Jembatan)
// ==========================================
export function calculateBeam(length: number, load: number, profileType: "WF200" | "WF300" | "WF400", material: "BJ37" | "BJ41" | "BJ50" = "BJ37") {
  // Standar SNI 1729:2020 / AISC 360-16
  const E = 200000; // Modulus Elastisitas Baja (MPa)
  
  // Database Profil WF (H x B x tw x tf)
  // Ix dalam mm^4, Zx (Modulus Plastis) dalam mm^3, Aw (Area Web) dalam mm^2
  const PROFILES = {
    WF200: { h: 200, tw: 5.5, Ix: 18400000, Zx: 200000, label: "WF 200x100" },
    WF300: { h: 300, tw: 6.5, Ix: 72100000, Zx: 514000, label: "WF 300x150" },
    WF400: { h: 400, tw: 8.0, Ix: 237000000, Zx: 1286000, label: "WF 400x200" }
  };
  
  const MATERIALS = {
    BJ37: 240, // Fy dalam MPa
    BJ41: 250,
    BJ50: 290
  };

  const p = PROFILES[profileType];
  const Fy = MATERIALS[material];

  // Kapasitas Penampang (Asumsi Fully Braced / Compact Section)
  const phi_b = 0.90;
  const phi_v = 1.00; // Asumsi web memenuhi batas tekuk geser
  
  const Mn = p.Zx * Fy; // N.mm
  const phiMn_kNm = (phi_b * Mn) / 1e6; // Kapasitas Momen Desain (kNm)
  
  const Aw = p.h * p.tw; // Luas web efektif mm2
  const Vn = 0.6 * Fy * Aw; // N
  const phiVn_kN = (phi_v * Vn) / 1000; // Kapasitas Geser Desain (kN)

  // Analisis Struktur Statis Tertentu (Beban Terpusat di Tengah Bentang)
  const L_mm = length * 1000;
  const maxMomen_kNm = (load * length) / 4; // Mu (kNm)
  const maxGeser_kN = load / 2; // Vu (kN)
  
  // P = load (kN), dikali 1000 jadi N
  const maxDeflection_mm = (load * 1000 * Math.pow(L_mm, 3)) / (48 * E * p.Ix);

  const points = [];
  for (let x = 0; x <= length; x += 0.5) {
    const sfd = x < length / 2 ? maxGeser_kN : (x > length / 2 ? -maxGeser_kN : 0);
    const bmd = x <= length / 2 ? (load / 2) * x : (load / 2) * (length - x);
    let def;
    const x_mm = x * 1000;
    if (x_mm <= L_mm / 2) {
      def = ((load * 1000 * x_mm) / (48 * E * p.Ix)) * (3 * L_mm * L_mm - 4 * x_mm * x_mm);
    } else {
      const x_prime = L_mm - x_mm;
      def = ((load * 1000 * x_prime) / (48 * E * p.Ix)) * (3 * L_mm * L_mm - 4 * x_prime * x_prime);
    }
    points.push({ x, sfd, bmd, def: -def });
  }

  let status: StatusType = "safe";
  let msg = "Desain memenuhi standar SNI 1729 (Kapasitas Momen, Geser, & Lendutan AMAN).";
  
  const limitDeflection = L_mm / 360; // L/360 untuk beban hidup
  
  if (maxMomen_kNm > phiMn_kNm) {
    status = "danger";
    msg = `BAHAYA LENTUR: Momen terjadi (${maxMomen_kNm.toFixed(1)} kNm) melebihi Kapasitas Desain Baja (ϕMn = ${phiMn_kNm.toFixed(1)} kNm)! Profil akan mengalami Yielding / Leleh.`;
  } else if (maxGeser_kN > phiVn_kN) {
    status = "danger";
    msg = `BAHAYA GESER: Gaya Geser (${maxGeser_kN.toFixed(1)} kN) melebihi Kapasitas Geser Web Baja (ϕVn = ${phiVn_kN.toFixed(1)} kN).`;
  } else if (maxDeflection_mm > limitDeflection) {
    status = "warning"; // Biasanya lendutan itu serviceability limit state, bukan collapse
    msg = `WASPADA LENDUTAN: Struktur masih kuat, namun lendutan (${maxDeflection_mm.toFixed(1)} mm) melampaui batas izin (L/360 = ${limitDeflection.toFixed(1)} mm).`;
  } else if (maxMomen_kNm > phiMn_kNm * 0.8) {
    status = "warning";
    msg = `WASPADA: Rasio tegangan lentur sudah mencapai ${(maxMomen_kNm/phiMn_kNm*100).toFixed(0)}%. Kapasitas hampir maksimal.`;
  }

  return { 
    maxMomen: maxMomen_kNm, 
    maxGeser: maxGeser_kN, 
    maxDeflection: maxDeflection_mm, 
    phiMn: phiMn_kNm,
    phiVn: phiVn_kN,
    limitDeflection,
    points, 
    status, 
    msg 
  };
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

  let status: StatusType = "safe"
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
// 3. CONCRETE (Mix Design SNI 7656 / ACI 211.1)
// ==========================================
export function calculateConcrete(targetStrength: number, flyAshPercent: number) {
  // ACI 211.1 Absolute Volume Method approximation
  // Asumsi: Agregat Maksimal 20mm, Slump 75-100mm, Non-Air Entrained
  const water = 200; // kg/m3 air
  const airVolume = 0.02; // 2% entrapped air
  
  // Perkiraan w/c ratio empiris berdasarkan f'c (Cylinder strength)
  let wc_ratio = 0.60;
  if (targetStrength >= 40) wc_ratio = 0.43;
  else if (targetStrength >= 30) wc_ratio = 0.54;
  else if (targetStrength >= 25) wc_ratio = 0.60;
  else wc_ratio = 0.70; // 20 MPa
  
  const totalCementitious = water / wc_ratio;
  
  const flyAshMass = totalCementitious * (flyAshPercent / 100);
  const cement = totalCementitious - flyAshMass;
  
  // Specific gravities
  const sg_cement = 3.15;
  const sg_flyash = 2.20;
  const sg_agg = 2.60;
  
  // Volume Kerikil (Coarse Agg) = 0.62 * 1600 (berat isi padat) = 992 kg
  const coarseAgg = 992;
  
  // Hitung volume absolut per m3
  const vol_water = water / 1000;
  const vol_cement = cement / (sg_cement * 1000);
  const vol_flyash = flyAshMass / (sg_flyash * 1000);
  const vol_coarse = coarseAgg / (sg_agg * 1000);
  
  // Pasir (Fine Agg) adalah sisa volume
  const vol_sand = 1.0 - (vol_water + vol_cement + vol_flyash + vol_coarse + airVolume);
  const fineAgg = vol_sand * (sg_agg * 1000);
  
  // CO2 Emission: ~0.9 kg CO2 per kg Semen, ~0.02 untuk Fly Ash
  const co2_standard = totalCementitious * 0.9;
  const co2_eco = (cement * 0.9) + (flyAshMass * 0.02);
  const co2_reduction = ((co2_standard - co2_eco) / co2_standard) * 100;

  let status: StatusType = "safe";
  let msg = "Mix Design memenuhi standar ACI 211.1 / SNI 7656. Proporsi absolut valid.";
  if (flyAshPercent > 35) {
    status = "danger";
    msg = "BAHAYA: Fly ash melebihi 35%. Kekuatan awal beton akan sangat rendah dan waktu ikat terlalu lama.";
  } else if (flyAshPercent > 20) {
    status = "warning";
    msg = "WASPADA: Penggunaan Fly Ash tinggi (High Volume Fly Ash Concrete). Perawatan (curing) basah harus ketat minimal 14 hari.";
  }

  return { 
    w_c: wc_ratio, 
    finalCement: cement, 
    flyAshMass, 
    water,
    fineAgg,
    coarseAgg,
    co2_standard, 
    co2_eco, 
    co2_reduction, 
    status, 
    msg 
  };
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

  let status: StatusType = "safe"
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

  let status: StatusType = "safe"
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
// 6. RETAINING WALL (Standar Geoteknik SNI 8460)
// ==========================================
export function calculateRetainingWall(height: number, soilType: "pasir" | "lempung") {
  const gamma = soilType === "pasir" ? 18 : 16; // kN/m3
  const phi = soilType === "pasir" ? 30 : 20; // derajat
  
  // Rankine Active Earth Pressure
  const Ka = Math.pow(Math.tan((45 - phi/2) * Math.PI / 180), 2);
  const Pa = 0.5 * Ka * gamma * Math.pow(height, 2); // Gaya dorong horizontal (kN/m)
  
  // Asumsi Dimensi Dinding Beton Gravitasi
  const baseWidth = height * 0.6; // B
  const W_concrete = baseWidth * height * 24; // Berat beton (kN/m)
  
  // Momen Guling (Overturning)
  const resistingMoment = W_concrete * (baseWidth / 2);
  const overturningMoment = Pa * (height / 3);
  const SF_overturning = resistingMoment / overturningMoment;
  
  // Gaya Geser (Sliding)
  const frictionAngleBase = (2/3) * phi; // Asumsi gesekan beton dengan tanah
  const resistingSliding = W_concrete * Math.tan(frictionAngleBase * Math.PI / 180);
  const SF_sliding = resistingSliding / Pa;
  
  // Eksentrisitas dan Daya Dukung Tanah Dasar
  const e = (baseWidth / 2) - ((resistingMoment - overturningMoment) / W_concrete);
  const q_max = (W_concrete / baseWidth) * (1 + (6 * e) / baseWidth);
  const q_all = soilType === "pasir" ? 200 : 100; // Asumsi daya dukung izin (kPa)
  
  let status: StatusType = "safe";
  let msg = "Desain Dinding Penahan Tanah memenuhi SF Guling > 1.5, SF Geser > 1.5, dan Kapasitas Tanah Aman.";
  
  if (SF_overturning < 1.5) {
    status = "danger";
    msg = `BAHAYA GULING: Faktor Keamanan Guling (${SF_overturning.toFixed(2)}) kurang dari 1.5! Dinding berisiko terjungkal.`;
  } else if (SF_sliding < 1.5) {
    status = "danger";
    msg = `BAHAYA GESER: Faktor Keamanan Geser/Sliding (${SF_sliding.toFixed(2)}) kurang dari 1.5! Dinding berisiko terseret ke depan. Tambahkan *Shear Key* di pondasi.`;
  } else if (Math.abs(e) > baseWidth / 6) {
    status = "warning";
    msg = `WASPADA EKSENTRISITAS: e = ${e.toFixed(2)}m melebihi B/6. Tanah akan mengalami tarik di satu sisi pondasi (Tension). Lebarkan pondasi.`;
  } else if (q_max > q_all) {
    status = "warning";
    msg = `WASPADA DAYA DUKUNG: Tegangan tanah q_max (${q_max.toFixed(0)} kPa) melampaui daya dukung izin (${q_all} kPa). Tanah berisiko ambles di bagian ujung (toe).`;
  }

  return { Pa, SF_overturning, SF_sliding, q_max, e_ratio: Math.abs(e)/(baseWidth/6), baseWidth, status, msg };
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

  let status: StatusType = "safe"
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

  let status: StatusType = "safe"
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

  let status: StatusType = "safe"
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
