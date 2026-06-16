import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

def page_retaining_wall():
    st.header("🧱 Simulasi Dinding Penahan Tanah (SNI 8460)")
    st.write("Analisis Kestabilan Eksternal Dinding Penahan Tanah Tipe Gravitasi. Mengecek Keamanan terhadap Guling, Geser, dan Daya Dukung Tanah Dasar sesuai **SNI 8460:2017**.")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Parameter Dinding & Tanah")
        tinggi = st.slider("Tinggi Dinding (H) [m]", 2.0, 10.0, 5.0, step=0.5)
        jenis_tanah = st.selectbox("Jenis Tanah Urugan (Backfill)", ["Pasir (Sand)", "Lempung (Clay)"])
        
        # Geotechnical Parameters
        if "Pasir" in jenis_tanah:
            gamma = 18.0
            phi = 30.0
            q_all = 200.0 # Daya dukung izin (kPa)
        else:
            gamma = 16.0
            phi = 20.0
            q_all = 100.0
            
        # Active Earth Pressure
        Ka = np.tan(np.radians(45 - phi/2))**2
        Pa = 0.5 * Ka * gamma * (tinggi**2)
        
        # Wall Properties (Asumsi dimensi rasio standar B = 0.6 H)
        base_width = tinggi * 0.6
        w_concrete = base_width * tinggi * 24.0 # Beton = 24 kN/m3
        
        # 1. Overturning (Guling)
        resisting_moment = w_concrete * (base_width / 2.0)
        overturning_moment = Pa * (tinggi / 3.0)
        sf_overturning = resisting_moment / overturning_moment
        
        # 2. Sliding (Geser)
        friction_angle_base = (2.0/3.0) * phi
        resisting_sliding = w_concrete * np.tan(np.radians(friction_angle_base))
        sf_sliding = resisting_sliding / Pa
        
        # 3. Bearing Capacity (Daya Dukung)
        e = (base_width / 2.0) - ((resisting_moment - overturning_moment) / w_concrete)
        q_max = (w_concrete / base_width) * (1.0 + (6.0 * e) / base_width)
        
        st.info(f"""
        📊 **Gaya Bekerja:**
        - **Gaya Dorong Aktif (Pa):** {Pa:.1f} kN/m
        - **Berat Dinding (W):** {w_concrete:.1f} kN/m
        
        ⚠️ **Metrik Kestabilan (Target $\ge 1.5$):**
        - **SF Guling:** {sf_overturning:.2f}
        - **SF Geser:** {sf_sliding:.2f}
        """)
        
    with col2:
        st.subheader("Visualisasi dan Pengecekan Kestabilan")
        
        fig, ax = plt.subplots(figsize=(6, 5))
        
        # Gambar tanah
        ax.fill_between([base_width, base_width+tinggi], [0, 0], [tinggi, tinggi], color='saddlebrown', alpha=0.3, label='Tanah Urugan')
        
        # Gambar dinding beton
        ax.fill_between([0, base_width], [0, 0], [tinggi, tinggi], color='gray', alpha=0.8, label='Dinding Beton')
        
        # Panah gaya dorong (Pa) - Bekerja di H/3
        ax.annotate('', xy=(base_width, tinggi/3), xytext=(base_width + tinggi/2, tinggi/3),
                    arrowprops=dict(facecolor='red', shrink=0.05, width=3, headwidth=10))
        ax.text(base_width + 0.2, tinggi/3 + 0.2, f'Pa = {Pa:.1f} kN', color='red', fontweight='bold')
        
        ax.set_xlim(-tinggi/2, base_width + tinggi)
        ax.set_ylim(-1, tinggi + 1)
        ax.set_aspect('equal')
        ax.set_xlabel("Lebar (m)")
        ax.set_ylabel("Tinggi (m)")
        ax.legend(loc='upper right')
        
        st.pyplot(fig)
        
        # Evaluation Logic
        if sf_overturning < 1.5:
            st.error(f"🚨 BAHAYA GULING: Faktor Keamanan Guling ({sf_overturning:.2f}) < 1.5. Dinding berisiko terjungkal.")
        elif sf_sliding < 1.5:
            st.error(f"🚨 BAHAYA GESER: Faktor Keamanan Geser ({sf_sliding:.2f}) < 1.5. Dinding berisiko terseret ke depan. Tambahkan *Shear Key*.")
        elif abs(e) > base_width / 6.0:
            st.warning(f"⚠️ WASPADA EKSENTRISITAS: e = {e:.2f}m melebihi B/6. Tanah mengalami gaya tarik (tension) di bagian tumit (heel).")
        elif q_max > q_all:
            st.warning(f"⚠️ WASPADA DAYA DUKUNG: Tegangan tanah ujung (q_max = {q_max:.0f} kPa) melampaui izin ({q_all} kPa).")
        else:
            st.success("✅ DESAIN AMAN: Dinding Penahan Tanah memenuhi seluruh kriteria kestabilan eksternal SNI 8460.")
