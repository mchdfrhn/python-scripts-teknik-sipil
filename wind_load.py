import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

def page_wind_load():
    st.header("💨 Beban Angin Bangunan (SNI 1727:2020 / ASCE 7-16)")
    st.write("Menghitung profil tekanan angin desain ($q_z$) sepanjang tinggi bangunan berdasarkan Kategori Eksposur (Kekasaran Permukaan).")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Parameter Angin")
        wind_speed = st.slider("Kecepatan Angin Dasar (m/s)", 20.0, 80.0, 30.0, step=1.0)
        building_height = st.slider("Tinggi Gedung (m)", 10.0, 200.0, 50.0, step=5.0)
        exposure = st.selectbox("Kategori Eksposur", [
            "Eksposur B (Perkotaan / Hutan / Padat)",
            "Eksposur C (Terbuka / Dataran Rata)",
            "Eksposur D (Tepi Pantai / Laut / Danau)"
        ])
        
        # SNI 1727 Constants
        if "B" in exposure:
            alpha = 7.0
            zg = 365.76
        elif "C" in exposure:
            alpha = 9.5
            zg = 274.32
        else:
            alpha = 11.5
            zg = 213.36
            
        Kd = 0.85
        Kzt = 1.0
        
        st.info(f"**Konstanta Eksposur:**\n- $\\alpha$ = {alpha}\n- $Z_g$ = {zg} m")
        
    with col2:
        elevations = np.arange(0, building_height + 1, max(1, building_height // 10))
        pressures = []
        
        for z in elevations:
            z_calc = max(z, 4.6) # Minimal 4.6m (15ft)
            Kz = 2.01 * ((z_calc / zg) ** (2.0 / alpha))
            qz = 0.613 * Kz * Kzt * Kd * (wind_speed ** 2)
            pressures.append(qz)
            
        max_p = max(pressures)
        
        fig, ax = plt.subplots(figsize=(6, 5))
        ax.barh(elevations, pressures, height=building_height/15, color='#0068C9', alpha=0.8, edgecolor='black')
        ax.set_xlabel("Tekanan Angin $q_z$ (Pascal)")
        ax.set_ylabel("Elevasi Bangunan (m)")
        ax.set_title(f"Profil Tekanan Angin (Max: {max_p:.0f} Pa)")
        ax.grid(True, linestyle='--', alpha=0.6)
        
        st.pyplot(fig)
        
        if max_p > 1500:
            st.error(f"🚨 BAHAYA: Tekanan angin sangat ekstrem ({max_p:.0f} Pa). Wajib gunakan sistem fasad khusus (kaca tempered tebal, rangka baja ekstra).")
        elif max_p > 800:
            st.warning(f"⚠️ WASPADA: Tekanan angin cukup tinggi ({max_p:.0f} Pa). Cladding dan kaca harus didesain tahan tekanan menengah-tinggi.")
        else:
            st.success(f"✅ AMAN: Tekanan angin ({max_p:.0f} Pa) masih dalam batas standar untuk kaca dan selubung bangunan biasa.")
