import math

# Concrete
fc_prime = 25
fly_ash = 15
water_content = 180
cement_content = (water_content / 0.5) * (1 - fly_ash/100)
fly_ash_content = (water_content / 0.5) * (fly_ash/100)
coarse_agg = 1000
fine_agg = 2400 - water_content - cement_content - fly_ash_content - coarse_agg
print("=== CONCRETE ===")
print("cement", cement_content, "fly_ash", fly_ash_content, "fine", fine_agg)

# Hydrology
area = 10
intensity = 50
runoff = 0.65
q = 0.278 * runoff * intensity * area
print("=== HYDROLOGY ===")
print("Q =", q)

# Soil Bearing
width = 1.0
c = 20.0
phi = 15.0
gamma = 18.0
Df = 1.0
phi_rad = math.radians(phi)
Nq = math.exp(math.pi * math.tan(phi_rad)) * (math.tan(math.pi/4 + phi_rad/2) ** 2)
Nc = (Nq - 1) * (1 / math.tan(phi_rad)) if phi > 0 else 5.14
Ngamma = 2 * (Nq + 1) * math.tan(phi_rad)
q_ult = (c * Nc) + (gamma * Df * Nq) + (0.5 * gamma * width * Ngamma)
q_all = q_ult / 3
print("=== SOIL BEARING ===")
print("Nc", Nc, "Nq", Nq, "Ngamma", Ngamma, "q_ult", q_ult, "q_all", q_all)

# Traffic
vol = 2500
lanes = 2
C0 = 1650
FCw = 1.0
FCsp = 1.0
FCsf = 0.90
FCcs = 1.0
capacity = C0 * lanes * FCw * FCsp * FCsf * FCcs
ds = vol / capacity
print("=== TRAFFIC ===")
print("capacity", capacity, "ds", ds)

