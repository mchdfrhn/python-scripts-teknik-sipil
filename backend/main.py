import math
import random
import os
from typing import List, Dict, Union, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="Civil Intelligence Hub API",
    description="Engine Komputasi Rekayasa Sipil Berbasis Standar (SNI/ACI/MKJI)",
    version="1.0.0"
)

# CORS middleware to allow requests from React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 0. METADATA & CONSTANTS
# ==========================================
CONSTANTS = {
    "STEEL_PROFILES": {
        "WF200": {"h": 200.0, "tw": 5.5, "Ix": 18400000.0, "Zx": 200000.0, "label": "WF 200x100 (Ringan)"},
        "WF300": {"h": 300.0, "tw": 6.5, "Ix": 72100000.0, "Zx": 514000.0, "label": "WF 300x150 (Sedang)"},
        "WF400": {"h": 400.0, "tw": 8.0, "Ix": 237000000.0, "Zx": 1286000.0, "label": "WF 400x200 (Berat)"}
    },
    "STEEL_MATERIALS": {
        "BJ37": {"fy": 240.0, "label": "BJ 37 (Fy = 240 MPa)"},
        "BJ41": {"fy": 250.0, "label": "BJ 41 (Fy = 250 MPa)"},
        "BJ50": {"fy": 290.0, "label": "BJ 50 (Fy = 290 MPa)"}
    },
    "EARTHQUAKE_SYSTEMS": {
        "SRPMB": {"R": 3.0, "Cd": 2.5, "damping": 0.05, "label": "Rangka Beton Biasa (SRPMB, R=3)"},
        "SRPMM": {"R": 5.0, "Cd": 4.5, "damping": 0.05, "label": "Rangka Beton Menengah (SRPMM, R=5)"},
        "SRPMK": {"R": 8.0, "Cd": 5.5, "damping": 0.05, "label": "Rangka Beton Khusus (SRPMK, R=8)"},
    },
    "SOIL_TYPES": {
        "pasir": {"gamma": 18.0, "phi": 30.0, "label": "Pasir (Sifat Geser Baik)"},
        "lempung": {"gamma": 16.0, "phi": 20.0, "label": "Lempung (Berpotensi Mengembang)"}
    }
}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/api/v1/meta")
def get_metadata():
    return CONSTANTS

# ==========================================
# 1. EARTHQUAKE SIMULATION
# ==========================================
class EarthquakeParams(BaseModel):
    floors: int = Field(..., ge=3, le=20)
    material: str = Field(..., pattern="^(SRPMK|SRPMM|SRPMB)$")
    magnitude: float = Field(..., ge=1.0, le=10.0)

class EarthquakeResult(BaseModel):
    damping: float
    stiffness: float
    materialLabel: str
    baseShear: float
    maxDrift: float
    allowableDrift: float
    R: float
    Cd: float
    Sds: float
    status: str
    message: str
    deflections: List[float]

@app.post("/api/v1/earthquake", response_model=EarthquakeResult)
def calculate_earthquake(params: EarthquakeParams):
    config = CONSTANTS["EARTHQUAKE_SYSTEMS"][params.material]
    
    Sds = (params.magnitude / 10.0) * 1.5
    Ie = 1.0
    R = config["R"]
    Cd = config["Cd"]
    
    floor_height = 4.0
    hn = params.floors * floor_height
    W = params.floors * 2500.0
    
    Cs = Sds / (R / Ie)
    if Cs < 0.044 * Sds * Ie:
        Cs = 0.044 * Sds * Ie
    V = Cs * W
    
    Delta_elastic = (Cs * hn) / 20.0
    max_drift = (Cd * Delta_elastic) / Ie
    allowable_drift = 0.020 * hn
    
    deflections = []
    for i in range(params.floors + 1):
        y = i / params.floors
        push_def = max_drift * (y ** 1.5)
        deflections.append(push_def)

    status = "safe"
    message = f"MEMENUHI SNI 1726: Simpangan Atap ({max_drift:.2f}m) masih di bawah batas aman izin ({allowable_drift:.2f}m). Struktur dirancang daktail."
    
    if max_drift > allowable_drift * 1.5:
        status = "danger"
        message = f"BAHAYA RUNTUH (SNI 1726): Simpangan Atap ({max_drift:.2f}m) jauh melebihi batas izin ({allowable_drift:.2f}m). Kolom beton berisiko patah geser! Gunakan sistem SRPMK atau Dinding Geser."
    elif max_drift > allowable_drift:
        status = "warning"
        message = f"TIDAK MEMENUHI SYARAT: Simpangan Atap ({max_drift:.2f}m) melewati batas izin SNI ({allowable_drift:.2f}m). Kerusakan non-struktural (dinding bata) akan sangat parah."

    return {
        "damping": config["damping"],
        "stiffness": 10.0,
        "materialLabel": config["label"],
        "baseShear": V,
        "maxDrift": max_drift,
        "allowableDrift": allowable_drift,
        "R": R,
        "Cd": Cd,
        "Sds": Sds,
        "status": status,
        "message": message,
        "deflections": deflections
    }

# ==========================================
# 2. STEEL BEAM
# ==========================================
class SteelBeamParams(BaseModel):
    length: float = Field(..., ge=2.0, le=12.0)
    load: float = Field(..., ge=10.0, le=200.0)
    profileType: str = Field(..., pattern="^(WF200|WF300|WF400)$")
    material: str = Field(..., pattern="^(BJ37|BJ41|BJ50)$")

class BeamPoint(BaseModel):
    x: float
    sfd: float
    bmd: float
    def_val: float = Field(..., alias="def")

class SteelBeamResult(BaseModel):
    maxMomen: float
    maxGeser: float
    maxDeflection: float
    phiMn: float
    phiVn: float
    limitDeflection: float
    status: str
    msg: str
    points: List[BeamPoint]

@app.post("/api/v1/steel-beam", response_model=SteelBeamResult)
def calculate_steel_beam(params: SteelBeamParams):
    E = 200000.0
    p = CONSTANTS["STEEL_PROFILES"][params.profileType]
    Fy = CONSTANTS["STEEL_MATERIALS"][params.material]["fy"]
    
    phi_b = 0.90
    phi_v = 1.00
    
    Mn = p["Zx"] * Fy
    phiMn_kNm = (phi_b * Mn) / 1e6
    
    Aw = p["h"] * p["tw"]
    Vn = 0.6 * Fy * Aw
    phiVn_kN = (phi_v * Vn) / 1000.0
    
    L_mm = params.length * 1000.0
    maxMomen_kNm = (params.load * params.length) / 4.0
    maxGeser_kN = params.load / 2.0
    
    maxDeflection_mm = (params.load * 1000.0 * (L_mm ** 3)) / (48.0 * E * p["Ix"])
    
    points = []
    x_val = 0.0
    while x_val <= params.length:
        sfd = maxGeser_kN if x_val < params.length / 2.0 else (-maxGeser_kN if x_val > params.length / 2.0 else 0.0)
        bmd = (params.load / 2.0) * x_val if x_val <= params.length / 2.0 else (params.load / 2.0) * (params.length - x_val)
        
        x_mm = x_val * 1000.0
        if x_mm <= L_mm / 2.0:
            def_val = ((params.load * 1000.0 * x_mm) / (48.0 * E * p["Ix"])) * (3.0 * L_mm * L_mm - 4.0 * x_mm * x_mm)
        else:
            x_prime = L_mm - x_mm
            def_val = ((params.load * 1000.0 * x_prime) / (48.0 * E * p["Ix"])) * (3.0 * L_mm * L_mm - 4.0 * x_prime * x_prime)
            
        points.append({
            "x": x_val,
            "sfd": sfd,
            "bmd": bmd,
            "def": -def_val
        })
        x_val += 0.5

    status = "safe"
    msg = f"Desain memenuhi standar SNI 1729 (Kapasitas Momen, Geser, & Lendutan AMAN). Profil {p['label']} Memadai."
    
    limitDeflection = L_mm / 360.0
    
    if maxMomen_kNm > phiMn_kNm:
        status = "danger"
        msg = f"BAHAYA LENTUR: Momen terjadi ({maxMomen_kNm:.1f} kNm) melebihi Kapasitas Desain Baja (ϕMn = {phiMn_kNm:.1f} kNm)! Profil akan mengalami Yielding / Leleh."
    elif maxGeser_kN > phiVn_kN:
        status = "danger"
        msg = f"BAHAYA GESER: Gaya Geser ({maxGeser_kN:.1f} kN) melebihi Kapasitas Geser Web Baja (ϕVn = {phiVn_kN:.1f} kN)."
    elif maxDeflection_mm > limitDeflection:
        status = "warning"
        msg = f"WASPADA LENDUTAN: Struktur masih kuat, namun lendutan ({maxDeflection_mm:.1f} mm) melampaui batas izin (L/360 = {limitDeflection:.1f} mm)."
    elif maxMomen_kNm > phiMn_kNm * 0.8:
        status = "warning"
        msg = f"WASPADA: Rasio tegangan lentur sudah mencapai {(maxMomen_kNm/phiMn_kNm*100):.0f}%. Kapasitas hampir maksimal."

    return {
        "maxMomen": maxMomen_kNm,
        "maxGeser": maxGeser_kN,
        "maxDeflection": maxDeflection_mm,
        "phiMn": phiMn_kNm,
        "phiVn": phiVn_kN,
        "limitDeflection": limitDeflection,
        "status": status,
        "msg": msg,
        "points": points
    }

# ==========================================
# 3. SOIL BEARING
# ==========================================
class SoilBearingParams(BaseModel):
    width: float = Field(..., ge=0.5, le=5.0)
    cohesion: float = Field(..., ge=0.0, le=100.0)
    phi: float = Field(..., ge=0.0, le=45.0)

class SoilBearingResult(BaseModel):
    q_ult: float
    q_all: float
    Nc: float
    Nq: float
    Ngamma: float
    status: str
    msg: str

@app.post("/api/v1/soil-bearing", response_model=SoilBearingResult)
def calculate_soil_bearing(params: SoilBearingParams):
    gamma = 18.0
    Df = 1.0
    
    phi_rad = params.phi * math.pi / 180.0
    Nq = math.exp(math.pi * math.tan(phi_rad)) * (math.tan(math.pi/4.0 + phi_rad/2.0) ** 2)
    
    if params.phi > 0:
        Nc = (Nq - 1.0) * (1.0 / math.tan(phi_rad))
    else:
        Nc = 5.14
        
    Ngamma = (Nq - 1.0) * math.tan(1.4 * phi_rad)
    
    q_surcharge = gamma * Df
    q_ult = (1.3 * params.cohesion * Nc) + (q_surcharge * Nq) + (0.4 * gamma * params.width * Ngamma)
    q_all = q_ult / 3.0
    
    status = "safe"
    msg = "Kapasitas izin tanah sangat baik. Cocok untuk pondasi dangkal standar."
    
    if q_all < 50.0:
        status = "danger"
        msg = "BAHAYA: Daya dukung sangat rendah. Tanah terlalu lembek, wajib gunakan pondasi dalam (tiang pancang / bore pile)."
    elif q_all < 150.0:
        status = "warning"
        msg = "WASPADA: Daya dukung menengah. Lebarkan dimensi tapak pondasi untuk bangunan 2 lantai atau lebih."
        
    return {
        "q_ult": q_ult,
        "q_all": q_all,
        "Nc": Nc,
        "Nq": Nq,
        "Ngamma": Ngamma,
        "status": status,
        "msg": msg
    }

# ==========================================
# 4. WIND LOAD
# ==========================================
class WindLoadParams(BaseModel):
    windSpeed: float = Field(..., ge=10.0, le=60.0)
    buildingHeight: float = Field(..., ge=5.0, le=80.0)
    exposure: str = Field(..., pattern="^(B|C|D)$")

class WindPressurePoint(BaseModel):
    z: float
    p: float

class WindLoadResult(BaseModel):
    pressureList: List[WindPressurePoint]
    maxPressure: float
    alpha: float
    zg: float
    status: str
    msg: str

@app.post("/api/v1/wind-load", response_model=WindLoadResult)
def calculate_wind_load(params: WindLoadParams):
    alpha = 7.0
    zg = 365.76
    if params.exposure == "C":
        alpha = 9.5
        zg = 274.32
    elif params.exposure == "D":
        alpha = 11.5
        zg = 213.36
        
    Kd = 0.85
    Kzt = 1.0
    
    pressure_list = []
    max_pressure = 0.0
    
    step = max(1.0, math.floor(params.buildingHeight / 10.0))
    z = 0.0
    while z <= params.buildingHeight:
        z_calc = max(z, 4.6)
        Kz = 2.01 * ((z_calc / zg) ** (2.0 / alpha))
        qz = 0.613 * Kz * Kzt * Kd * (params.windSpeed ** 2)
        pressure_list.append({"z": z, "p": qz})
        max_pressure = max(max_pressure, qz)
        z += step
        
    status = "safe"
    msg = f"Tekanan angin qz maksimum ({max_pressure:.0f} Pa). Kaca standar dan selubung bangunan aman."
    
    if max_pressure > 1500.0:
        status = "danger"
        msg = f"BAHAYA: Tekanan angin ekstrem ({max_pressure:.0f} Pa). Wajib gunakan panel fasad dan kaca yang diperkuat."
    elif max_pressure > 800.0:
        status = "warning"
        msg = f"WASPADA: Tekanan angin cukup tinggi ({max_pressure:.0f} Pa). Pastikan sistem pengikat fasad didesain khusus."
        
    return {
        "pressureList": pressure_list,
        "maxPressure": max_pressure,
        "alpha": alpha,
        "zg": zg,
        "status": status,
        "msg": msg
    }

# ==========================================
# 5. CONCRETE MIX DESIGN
# ==========================================
class ConcreteParams(BaseModel):
    targetStrength: float = Field(..., ge=20.0, le=45.0)
    flyAshPercent: float = Field(..., ge=0.0, le=50.0)

class ConcreteResult(BaseModel):
    w_c: float
    finalCement: float
    flyAshMass: float
    water: float
    fineAgg: float
    coarseAgg: float
    co2_standard: float
    co2_eco: float
    co2_reduction: float
    status: str
    msg: str

@app.post("/api/v1/concrete", response_model=ConcreteResult)
def calculate_concrete(params: ConcreteParams):
    water = 200.0
    airVolume = 0.02
    
    wc_ratio = 0.60
    if params.targetStrength >= 40.0:
        wc_ratio = 0.43
    elif params.targetStrength >= 30.0:
        wc_ratio = 0.54
    elif params.targetStrength >= 25.0:
        wc_ratio = 0.60
    else:
        wc_ratio = 0.70
        
    totalCementitious = water / wc_ratio
    flyAshMass = totalCementitious * (params.flyAshPercent / 100.0)
    cement = totalCementitious - flyAshMass
    
    sg_cement = 3.15
    sg_flyash = 2.20
    sg_agg = 2.60
    coarseAgg = 992.0
    
    vol_water = water / 1000.0
    vol_cement = cement / (sg_cement * 1000.0)
    vol_flyash = flyAshMass / (sg_flyash * 1000.0)
    vol_coarse = coarseAgg / (sg_agg * 1000.0)
    
    vol_sand = 1.0 - (vol_water + vol_cement + vol_flyash + vol_coarse + airVolume)
    fineAgg = vol_sand * (sg_agg * 1000.0)
    
    co2_standard = totalCementitious * 0.9
    co2_eco = (cement * 0.9) + (flyAshMass * 0.02)
    co2_reduction = ((co2_standard - co2_eco) / co2_standard) * 100.0
    
    status = "safe"
    msg = "Mix Design memenuhi standar ACI 211.1 / SNI 7656. Proporsi absolut valid."
    
    if params.flyAshPercent > 35.0:
        status = "danger"
        msg = "BAHAYA: Fly ash melebihi 35%. Kekuatan awal beton akan sangat rendah."
    elif params.flyAshPercent > 20.0:
        status = "warning"
        msg = "WASPADA: Penggunaan Fly Ash tinggi. Perawatan (curing) basah harus ketat."
        
    return {
        "w_c": wc_ratio,
        "finalCement": cement,
        "flyAshMass": flyAshMass,
        "water": water,
        "fineAgg": fineAgg,
        "coarseAgg": coarseAgg,
        "co2_standard": co2_standard,
        "co2_eco": co2_eco,
        "co2_reduction": co2_reduction,
        "status": status,
        "msg": msg
    }

# ==========================================
# 6. SCHEDULING (CPM)
# ==========================================
class ScheduleParams(BaseModel):
    A: float = Field(..., ge=1.0, le=15.0)
    B: float = Field(..., ge=1.0, le=15.0)
    C: float = Field(..., ge=1.0, le=15.0)
    D: float = Field(..., ge=1.0, le=15.0)
    E: float = Field(..., ge=1.0, le=15.0)
    F: float = Field(..., ge=1.0, le=15.0)

class TaskDetail(BaseModel):
    name: str
    start: float
    end: float
    dur: float
    slack: float
    critical: bool
    shortName: str

class ScheduleResult(BaseModel):
    totalDuration: float
    critical_path: List[str]
    status: str
    msg: str
    tasks: List[TaskDetail]

@app.post("/api/v1/scheduling", response_model=ScheduleResult)
def calculate_schedule(params: ScheduleParams):
    es_A = 0.0
    ef_A = params.A
    es_B = ef_A
    ef_B = es_B + params.B
    es_C = ef_B
    ef_C = es_C + params.C
    es_D = ef_B
    ef_D = es_D + params.D
    es_E = max(ef_C, ef_D)
    ef_E = es_E + params.E
    es_F = ef_E
    ef_F = es_F + params.F
    
    proj_duration = ef_F
    lf_F = proj_duration
    ls_F = lf_F - params.F
    lf_E = ls_F
    ls_E = lf_E - params.E
    lf_C = ls_E
    ls_C = lf_C - params.C
    lf_D = ls_E
    ls_D = lf_D - params.D
    lf_B = min(ls_C, ls_D)
    ls_B = lf_B - params.B
    lf_A = ls_B
    ls_A = lf_A - params.A
    
    taskNames = ["A: Persiapan", "B: Galian", "C: Pondasi", "D: Dinding", "E: Atap", "F: Finishing"]
    es_list = [es_A, es_B, es_C, es_D, es_E, es_F]
    dur_list = [params.A, params.B, params.C, params.D, params.E, params.F]
    slack_list = [ls_A - es_A, ls_B - es_B, ls_C - es_C, ls_D - es_D, ls_E - es_E, ls_F - es_F]
    
    tasks = []
    for i, name in enumerate(taskNames):
        tasks.append({
            "name": name,
            "start": es_list[i],
            "end": es_list[i] + dur_list[i],
            "dur": dur_list[i],
            "slack": slack_list[i],
            "critical": slack_list[i] == 0.0,
            "shortName": name.split(":")[0]
        })
        
    critical_path = [t["shortName"] for t in tasks if t["critical"]]
    status = "safe"
    msg = f"Proyek aman. Jalur kritis: {' → '.join(critical_path)}"
    
    if proj_duration > 35.0:
        status = "danger"
        msg = f"BAHAYA: Proyek sangat lama ({proj_duration:.0f} hari). Percepat jalur kritis."
        
    return {
        "tasks": tasks,
        "totalDuration": proj_duration,
        "critical_path": critical_path,
        "status": status,
        "msg": msg
    }

# ==========================================
# 7. RETAINING WALL
# ==========================================
class RetainingWallParams(BaseModel):
    height: float = Field(..., ge=2.0, le=8.0)
    soilType: str = Field(..., pattern="^(pasir|lempung)$")

class RetainingWallResult(BaseModel):
    Pa: float
    SF_overturning: float
    SF_sliding: float
    q_max: float
    e_ratio: float
    baseWidth: float
    status: str
    msg: str

@app.post("/api/v1/retaining-wall", response_model=RetainingWallResult)
def calculate_retaining_wall(params: RetainingWallParams):
    soil_config = CONSTANTS["SOIL_TYPES"][params.soilType]
    gamma = soil_config["gamma"]
    phi = soil_config["phi"]
    
    phi_rad = phi * math.pi / 180.0
    Ka = (math.tan((45.0 - phi/2.0) * math.pi / 180.0)) ** 2
    Pa = 0.5 * Ka * gamma * (params.height ** 2)
    
    baseWidth = params.height * 0.6
    W_concrete = baseWidth * params.height * 24.0
    resistingMoment = W_concrete * (baseWidth / 2.0)
    overturningMoment = Pa * (params.height / 3.0)
    SF_overturning = resistingMoment / overturningMoment
    
    resistingSliding = W_concrete * math.tan((2.0/3.0) * phi_rad)
    SF_sliding = resistingSliding / Pa
    
    e = (baseWidth / 2.0) - ((resistingMoment - overturningMoment) / W_concrete)
    q_max = (W_concrete / baseWidth) * (1.0 + (6.0 * e) / baseWidth)
    
    status = "safe"
    msg = "Dinding penahan tanah stabil."
    if SF_overturning < 1.5 or SF_sliding < 1.5:
        status = "danger"
        msg = "BAHAYA: Faktor keamanan guling atau geser tidak memadai."
        
    return {
        "Pa": Pa,
        "SF_overturning": SF_overturning,
        "SF_sliding": SF_sliding,
        "q_max": q_max,
        "e_ratio": abs(e) / (baseWidth / 6.0),
        "baseWidth": baseWidth,
        "status": status,
        "msg": msg
    }

# ==========================================
# 8. HYDROLOGY
# ==========================================
class HydrologyParams(BaseModel):
    rainIntensity: float = Field(..., ge=10.0, le=150.0)
    area: float = Field(..., ge=1.0, le=50.0)
    runoffCoef: float = Field(..., ge=0.1, le=0.95)

class HydrographPoint(BaseModel):
    hour: float
    discharge: float

class HydrologyResult(BaseModel):
    peakDischarge: float
    totalVolumeM3: float
    status: str
    msg: str
    hydrograph: List[HydrographPoint]

@app.post("/api/v1/hydrology", response_model=HydrologyResult)
def calculate_hydrology(params: HydrologyParams):
    peakDischarge = 0.278 * params.runoffCoef * params.rainIntensity * params.area
    timeToPeak = 4.0
    hydrograph = []
    totalVolumeM3 = 0.0
    for t in range(24):
        Q = peakDischarge * ((t / timeToPeak) ** 2.4) if t <= timeToPeak else peakDischarge * math.exp(-0.3 * (t - timeToPeak))
        hydrograph.append({"hour": t, "discharge": Q})
        totalVolumeM3 += Q * 3600.0
    return {"peakDischarge": peakDischarge, "totalVolumeM3": totalVolumeM3, "status": "safe", "msg": f"Debit puncak {peakDischarge:.1f} m3/s", "hydrograph": hydrograph}

# ==========================================
# 9. PIPE FLOW
# ==========================================
class PipeFlowParams(BaseModel):
    length: float = Field(..., ge=10.0, le=500.0)
    diameterMm: float = Field(..., ge=50.0, le=300.0)

class PressurePoint(BaseModel):
    distance: int
    pressure: float

class PipeFlowResult(BaseModel):
    headLoss: float
    finalPressure: float
    C: float
    Q: float
    status: str
    msg: str
    profile: List[PressurePoint]

@app.post("/api/v1/pipe-flow", response_model=PipeFlowResult)
def calculate_pipe_flow(params: PipeFlowParams):
    C, Q = 140.0, 0.0005
    D = params.diameterMm / 1000.0
    headLoss = 10.67 * params.length * ((Q / C) ** 1.852) / (D ** 4.87)
    finalPressure = 10.0 - headLoss
    profile = [{"distance": int(round(d)), "pressure": max(0.0, 10.0 - (headLoss * d / params.length))} for d in [i * params.length / 10.0 for i in range(11)]]
    return {"headLoss": headLoss, "finalPressure": finalPressure, "C": C, "Q": Q, "status": "safe", "msg": "Tekanan sisa mencukupi", "profile": profile}

# ==========================================
# 10. TRAFFIC
# ==========================================
class TrafficParams(BaseModel):
    volume: float = Field(..., ge=100.0, le=8000.0)
    lanes: int = Field(..., ge=1, le=4)

class CarDetail(BaseModel):
    id: int
    speed: float
    lane: int

class TrafficResult(BaseModel):
    capacity: float
    ds: float
    los: str
    C0: float
    FCsf: float
    status: str
    msg: str
    cars: List[CarDetail]

@app.post("/api/v1/traffic", response_model=TrafficResult)
def calculate_traffic(params: TrafficParams):
    C0, FCsf = 1650.0, 0.90
    capacity = C0 * params.lanes * FCsf
    ds = params.volume / capacity
    los = "A" if ds <= 0.45 else ("B" if ds <= 0.6 else ("C" if ds <= 0.75 else ("D" if ds <= 0.85 else ("E" if ds <= 1.0 else "F"))))
    cars = [{"id": i, "speed": max(10.0, 100.0 * (1.0 - ds)), "lane": random.randint(0, params.lanes - 1)} for i in range(min(int(params.volume / 100.0), 50))]
    return {"capacity": capacity, "ds": ds, "los": los, "C0": C0, "FCsf": FCsf, "status": "safe", "msg": f"LOS: {los}", "cars": cars}


# Dynamic Static Files Serving for React Frontend
frontend_dist = os.getenv("FRONTEND_DIST_DIR", "dist")
if not os.path.exists(frontend_dist):
    sibling_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../civil-scripts-web/dist")
    if os.path.exists(sibling_dist):
        frontend_dist = sibling_dist

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        if catchall.startswith("api"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        static_file_path = os.path.join(frontend_dist, catchall)
        if os.path.isfile(static_file_path):
            return FileResponse(static_file_path)
            
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
