import streamlit as st
import math

def page_soil_bearing():
    st.header("🏗️ Daya Dukung Tanah (Kapasitas Meyerhof)")
    st.write("Menghitung kapasitas dukung tanah ultimit ($q_{ult}$) dan izin ($q_{all}$) untuk pondasi tapak (square footing) menggunakan persamaan Meyerhof.")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Parameter Tanah & Pondasi")
        width = st.slider("Lebar Pondasi (m)", 0.5, 3.0, 1.0, step=0.1)
        cohesion = st.slider("Kohesi Tanah, c (kPa)", 0.0, 100.0, 20.0)
        phi = st.slider("Sudut Geser Dalam, $\phi$ (derajat)", 0.0, 45.0, 15.0)
        
        # Meyerhof calculations
        gamma = 18.0 # kN/m3
        Df = 1.0 # m
        phi_rad = math.radians(phi)
        
        # Bearing capacity factors
        Nq = math.exp(math.pi * math.tan(phi_rad)) * (math.tan(math.pi/4 + phi_rad/2) ** 2)
        
        if phi > 0:
            Nc = (Nq - 1) * (1 / math.tan(phi_rad))
        else:
            Nc = 5.14
            
        Ngamma = (Nq - 1) * math.tan(1.4 * phi_rad)
        
        # Ultimate bearing capacity
        q = gamma * Df
        q_ult = (1.3 * cohesion * Nc) + (q * Nq) + (0.4 * gamma * width * Ngamma)
        q_all = q_ult / 3.0 # SF = 3
        
        st.info(f"""
        **Faktor Kapasitas Dukung Meyerhof:**
        - $N_c$ = {Nc:.2f}
        - $N_q$ = {Nq:.2f}
        - $N_\\gamma$ = {Ngamma:.2f}
        """)

    with col2:
        st.subheader("Hasil Analisis")
        st.metric("Daya Dukung Ultimit ($q_{ult}$)", f"{q_ult:.1f} kPa")
        st.metric("Daya Dukung Izin ($q_{all}$)", f"{q_all:.1f} kPa", "Safety Factor = 3.0")
        
        if q_all < 50:
            st.error("🚨 BAHAYA: Daya dukung sangat rendah. Tanah terlalu lembek, wajib gunakan pondasi dalam (tiang pancang / bore pile).")
        elif q_all < 150:
            st.warning("⚠️ WASPADA: Daya dukung menengah. Lebarkan dimensi tapak pondasi untuk bangunan 2 lantai atau lebih.")
        else:
            st.success("✅ AMAN: Kapasitas izin tanah sangat baik. Cocok untuk pondasi dangkal standar.")
