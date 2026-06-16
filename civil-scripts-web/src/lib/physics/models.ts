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
// 2. WIND LOAD (Beban Angin SNI 1727:2020 / ASCE 7-16)
// ==========================================
export function calculateWindLoad(windSpeed: number, buildingHeight: number, exposure: "B" | "C" | "D" = "B") {
  const pressureList = []
  let maxPressure = 0
  
  // SNI 1727 Table 26.11-1 Terrain Exposure Constants
  let alpha = 7.0;
  let zg = 365.76;
  if (exposure === "C") {
    alpha = 9.5;
    zg = 274.32;
  } else if (exposure === "D") {
    alpha = 11.5;
    zg = 213.36;
  }
  
  const Kd = 0.85; // Directionality factor untuk bangunan
  const Kzt = 1.0; // Topographic factor (asumsi rata)

  for (let z = 0; z <= buildingHeight; z += Math.max(1, Math.floor(buildingHeight / 10))) {
    // Elevasi z tidak boleh kurang dari 4.6m (15 ft) untuk perhitungan Kz
    const z_calc = Math.max(z, 4.6);
    
    // Koefisien Eksposur Tekanan Kecepatan (Kz)
    const Kz = 2.01 * Math.pow(z_calc / zg, 2.0 / alpha);
    
    // Tekanan Kecepatan qz = 0.613 * Kz * Kzt * Kd * V^2 (N/m2)
    const qz = 0.613 * Kz * Kzt * Kd * Math.pow(windSpeed, 2);
    
    pressureList.push({ z, p: qz });
    maxPressure = Math.max(maxPressure, qz);
  }

  let status: StatusType = "safe";
  let msg = `Tekanan angin qz maksimum (${maxPressure.toFixed(0)} Pa). Kaca standar dan selubung bangunan aman.`;
  
  if (maxPressure > 1500) {
    status = "danger";
    msg = `BAHAYA: Tekanan angin ekstrem (${maxPressure.toFixed(0)} Pa). Wajib gunakan panel fasad dan kaca yang diperkuat (tempered tebal / rangka aluminium ekstra).`;
  } else if (maxPressure > 800) {
    status = "warning";
    msg = `WASPADA: Tekanan angin cukup tinggi (${maxPressure.toFixed(0)} Pa). Pastikan sistem pengikat fasad (cladding) didesain khusus.`;
  }

  return { pressureList, maxPressure, status, msg };
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
// 5. SOIL BEARING (Kapasitas Dukung Meyerhof)
// ==========================================
export function calculateSoilBearing(width: number, cohesion: number, phi: number) {
  const gamma = 18; // kN/m3
  const Df = 1.0; // Kedalaman pondasi m
  
  // Meyerhof Bearing Capacity Factors
  const phi_rad = phi * Math.PI / 180;
  
  // Nq
  const Nq = Math.exp(Math.PI * Math.tan(phi_rad)) * Math.pow(Math.tan(Math.PI/4 + phi_rad/2), 2);
  
  // Nc
  let Nc = 5.14; // untuk phi = 0
  if (phi > 0) {
    Nc = (Nq - 1) * (1 / Math.tan(phi_rad));
  }
  
  // Ngamma
  const Ngamma = (Nq - 1) * Math.tan(1.4 * phi_rad);

  // Kapasitas Dukung Ultimit (Square Footing Assumption)
  // q_ult = 1.3 c Nc + q Nq + 0.4 gamma B Ngamma
  const q = gamma * Df;
  const q_ult = (1.3 * cohesion * Nc) + (q * Nq) + (0.4 * gamma * width * Ngamma);
  const q_all = q_ult / 3.0; // Safety Factor = 3

  let status: StatusType = "safe";
  let msg = `Pondasi aman. Kapasitas izin tanah (q_all) mencapai ${q_all.toFixed(0)} kPa.`;
  
  if (q_all < 50) {
    status = "danger";
    msg = `BAHAYA: Daya dukung sangat rendah (${q_all.toFixed(0)} kPa). Tanah terlalu lembek, wajib gunakan pondasi dalam (tiang pancang / bore pile).`;
  } else if (q_all < 150) {
    status = "warning";
    msg = `WASPADA: Daya dukung menengah (${q_all.toFixed(0)} kPa). Lebarkan dimensi tapak pondasi untuk bangunan lebih dari 2 lantai.`;
  }

  return { q_ult, q_all, Nc, Nq, Ngamma, status, msg };
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
// 7. HYDROLOGY (Metode Rasional SNI 2415)
// ==========================================
export function calculateHydrology(rainIntensity: number, area: number, runoffCoef: number) {
  // Metode Rasional: Q = 0.278 * C * I * A
  // rainIntensity (I) dalam mm/jam
  // area (A) dalam km2
  // runoffCoef (C) tak berdimensi
  
  const peakDischarge = 0.278 * runoffCoef * rainIntensity * area; // m3/s

  // Create simple Unit Hydrograph for visualization
  const timeHours = Array.from({length: 24}, (_, i) => i);
  const timeToPeak = 4; // Jam ke-4 banjir bandang
  
  const hydrograph = timeHours.map(t => {
    // Kurva Gamma / Nakayasu approximation
    let Q = 0;
    if (t > 0) {
      if (t <= timeToPeak) {
        Q = peakDischarge * Math.pow(t / timeToPeak, 2.4);
      } else {
        Q = peakDischarge * Math.exp(-0.3 * (t - timeToPeak));
      }
    }
    return { hour: t, discharge: Q };
  });

  const totalVolumeM3 = hydrograph.reduce((sum, h) => sum + (h.discharge * 3600), 0);

  let status: StatusType = "safe";
  let msg = `Debit puncak ${peakDischarge.toFixed(1)} m³/s. Saluran drainase standar masih mampu menampung.`;
  
  if (peakDischarge > 100) {
    status = "danger";
    msg = `BAHAYA BANJIR BANDANG: Debit sangat besar (${peakDischarge.toFixed(1)} m³/s). Diperlukan bendungan pengendali banjir skala besar.`;
  } else if (peakDischarge > 40) {
    status = "warning";
    msg = `WASPADA BANJIR: Debit puncak tinggi (${peakDischarge.toFixed(1)} m³/s). Normalisasi sungai dan pembuatan polder wajib dilakukan.`;
  }

  return { peakDischarge, hydrograph, totalVolumeM3, status, msg };
}

// ==========================================
// 8. PIPE FLOW (Hazen-Williams Head Loss)
// ==========================================
export function calculatePipeFlow(length: number, diameterMm: number) {
  // Asumsi Pipa PVC (C = 140) dan Debit Aliran Konstan (Q = 0.5 liter/detik)
  const C = 140; 
  const Q = 0.0005; // m3/s
  const D = diameterMm / 1000.0; // m
  
  // Hazen-Williams Head Loss equation (m)
  // hf = 10.67 * L * (Q / C)^1.852 / D^4.87
  const headLoss = 10.67 * length * Math.pow(Q / C, 1.852) / Math.pow(D, 4.87);
  
  const initialPressure = 10.0; // Head awal 10 meter (seperti tandon air 10m)
  const finalPressure = initialPressure - headLoss;

  const profile = [];
  for (let dist = 0; dist <= length; dist += length / 10) {
    const p = initialPressure - (headLoss * (dist / length));
    profile.push({ distance: Math.round(dist), pressure: Math.max(0, p) });
  }

  let status: StatusType = "safe";
  let msg = "Tekanan sisa mencukupi. Aliran air di ujung pipa deras.";

  if (finalPressure < 0) {
    status = "danger";
    msg = "BAHAYA: Air tidak mengalir! Pipa terlalu kecil atau terlalu panjang sehingga terjadi friction loss yang melebihi tekanan awal.";
  } else if (finalPressure < 3) {
    status = "warning";
    msg = "WASPADA: Tekanan sisa sangat lemah (< 3m). Aliran air di keran akan sangat kecil (ngeres).";
  }

  return { headLoss, finalPressure, profile, status, msg };
}

// ==========================================
// 9. TRAFFIC (Kapasitas Jalan MKJI 1997 / HCM)
// ==========================================
export function calculateTraffic(volume: number, lanes: number) {
  // Manual Kapasitas Jalan Indonesia (MKJI) 1997
  // Asumsi: Jalan Perkotaan Terbagi (Divided), Lebar Lajur 3.5m, Hambatan Samping Sedang
  
  const C0 = 1650; // Kapasitas Dasar per lajur (smp/jam)
  const FCw = 1.0; // Faktor Penyesuaian Lebar Lajur (3.5m = 1.0)
  const FCsp = 1.0; // Faktor Pemisah Arah
  const FCsf = 0.90; // Faktor Hambatan Samping Sedang
  const FCcs = 1.0; // Ukuran Kota Menengah
  
  const capacity = C0 * lanes * FCw * FCsp * FCsf * FCcs;
  const ds = volume / capacity; // Degree of Saturation

  let status: StatusType = "safe";
  let los = "A";
  let msg = "Lalu lintas sangat lancar (Arus Bebas). Pengemudi dapat memilih kecepatan dengan bebas.";

  if (ds > 1.0) {
    status = "danger";
    los = "F";
    msg = "MACET TOTAL (Level F): Arus tertahan, antrean panjang, kecepatan sangat rendah.";
  } else if (ds > 0.85) {
    status = "danger";
    los = "E";
    msg = "MENDEKATI MACET (Level E): Volume mendekati kapasitas, sering berhenti.";
  } else if (ds > 0.75) {
    status = "warning";
    los = "D";
    msg = "ARUS PADAT (Level D): Kecepatan menurun signifikan, jarak antar kendaraan sangat rapat.";
  } else if (ds > 0.60) {
    status = "safe";
    los = "C";
    msg = "ARUS STABIL (Level C): Kepadatan mulai terasa, gerak kendaraan cukup dibatasi.";
  } else if (ds > 0.45) {
    status = "safe";
    los = "B";
    msg = "LANCAR (Level B): Arus stabil, masih ada ruang bermanuver.";
  }

  // Generate fake cars for animation (Optional)
  const cars = Array.from({length: Math.min(volume/100, 50)}, (_, i) => ({
    id: i,
    speed: Math.max(10, 100 * (1 - ds)),
    lane: i % lanes
  }))

  return { capacity, ds, los, cars, status, msg };
}
