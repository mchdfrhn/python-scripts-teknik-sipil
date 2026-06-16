import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_steel_beam():
    st.header("🌉 Kelenturan Balok Baja (Standar SNI 1729)")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Simulasi ini sekarang menggunakan **Standar Nasional Indonesia (SNI 1729:2020) / AISC 360-16** untuk mengecek Kapasitas Momen Lentur ($M_n$), Kapasitas Geser ($V_n$), dan Batas Lendutan. Ini adalah parameter sesungguhnya yang digunakan oleh insinyur sipil di lapangan.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Konfigurasi Balok Jembatan")
        L = st.slider("Panjang Jembatan / Balok (Meter)", 2.0, 12.0, 6.0, step=0.5, help="Panjang bentang bebas balok.")
        
        P = st.slider("Berat Beban Terpusat (kN)", 10.0, 200.0, 50.0, step=5.0, help="Satu beban berat tunggal tepat di tengah jembatan (50 kN ≈ 5 Ton).")
            
        st.markdown("---")
        st.subheader("Spesifikasi Balok Baja")
        profile = st.selectbox("Pilihan Ukuran Profil WF", [
            "WF 200x100 (Ringan)", 
            "WF 300x150 (Sedang)", 
            "WF 400x200 (Berat)"
        ])
        
        material = st.selectbox("Mutu Baja", [
            "BJ 37 (Fy = 240 MPa)",
            "BJ 41 (Fy = 250 MPa)",
            "BJ 50 (Fy = 290 MPa)"
        ])
        
        # Parse material
        if "BJ 37" in material:
            Fy = 240.0
        elif "BJ 41" in material:
            Fy = 250.0
        else:
            Fy = 290.0

        # Parse profile properties
        # Ix in mm^4, Zx in mm^3, Aw in mm^2
        if "WF 200" in profile:
            h, tw = 200.0, 5.5
            Ix = 18400000.0
            Zx = 200000.0
        elif "WF 300" in profile:
            h, tw = 300.0, 6.5
            Ix = 72100000.0
            Zx = 514000.0
        else: # WF 400
            h, tw = 400.0, 8.0
            Ix = 237000000.0
            Zx = 1286000.0
            
        E = 200000.0 # MPa
        
    with col2:
        x = np.linspace(0, L, 100)
        
        # --- PERHITUNGAN SNI 1729 ---
        # 1. Kapasitas Penampang
        phi_b = 0.90
        phi_v = 1.00
        
        Mn = Zx * Fy # N.mm
        phi_Mn_kNm = (phi_b * Mn) / 1e6
        
        Aw = h * tw
        Vn = 0.6 * Fy * Aw
        phi_Vn_kN = (phi_v * Vn) / 1000.0
        
        # 2. Analisis Struktur (Beban Terpusat P di Tengah Bentang)
        L_mm = L * 1000.0
        max_moment = (P * L) / 4.0 # Mu (kNm)
        max_shear = P / 2.0 # Vu (kN)
        
        # Deflection curve
        deflection_mm = np.zeros(len(x))
        for i, xi in enumerate(x):
            xi_mm = xi * 1000.0
            if xi_mm <= L_mm / 2.0:
                deflection_mm[i] = ((P * 1000.0 * xi_mm) / (48.0 * E * Ix)) * (3 * L_mm**2 - 4 * xi_mm**2)
            else:
                x_mirror = L_mm - xi_mm
                deflection_mm[i] = ((P * 1000.0 * x_mirror) / (48.0 * E * Ix)) * (3 * L_mm**2 - 4 * x_mirror**2)
        
        max_deflection_mm = (P * 1000.0 * L_mm**3) / (48.0 * E * Ix)
        limit_deflection = L_mm / 360.0
        
        # Status checks
        is_moment_safe = max_moment <= phi_Mn_kNm
        is_shear_safe = max_shear <= phi_Vn_kN
        is_deflection_safe = max_deflection_mm <= limit_deflection
            
        # Metrics Display
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Momen Lentur (Mu)", f"{max_moment:.1f} kNm", 
                      delta=f"Kapasitas (ϕMn): {phi_Mn_kNm:.1f} kNm", 
                      delta_color="normal" if is_moment_safe else "inverse")
        with m2:
            st.metric("Gaya Geser (Vu)", f"{max_shear:.1f} kN", 
                      delta=f"Kapasitas (ϕVn): {phi_Vn_kN:.1f} kN", 
                      delta_color="normal" if is_shear_safe else "inverse")
        with m3:
            st.metric("Lendutan Aktual", f"{max_deflection_mm:.2f} mm",
                      delta=f"Batas Izin: {limit_deflection:.1f} mm",
                      delta_color="normal" if is_deflection_safe else "inverse")
            
        # Plotting 3 diagrams (SFD, BMD, Deflection)
        fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(6, 8.5), sharex=True)
        
        # Calculate Shear and Moment arrays for plotting
        shear_arr = np.where(x <= L/2, max_shear, -max_shear)
        moment_arr = np.where(x <= L/2, max_shear * x, max_shear * (L - x))
        
        # 1. Shear Force Diagram
        ax1.plot(x, shear_arr, color='#0068C9', lw=2)
        ax1.fill_between(x, shear_arr, color='#0068C9', alpha=0.15)
        ax1.axhline(0, color='black', lw=1.2)
        ax1.axhline(phi_Vn_kN, color='red', linestyle='--', alpha=0.5, label='Kapasitas Geser ϕVn')
        ax1.axhline(-phi_Vn_kN, color='red', linestyle='--', alpha=0.5)
        ax1.set_ylabel('Gaya Geser (kN)')
        ax1.set_title('Diagram Gaya Geser (SFD)')
        ax1.grid(True, alpha=0.3)
        ax1.legend(loc="upper right", fontsize="small")
        
        # 2. Bending Moment Diagram
        ax2.plot(x, moment_arr, color='#FF4B4B', lw=2)
        ax2.fill_between(x, moment_arr, color='#FF4B4B', alpha=0.15)
        ax2.axhline(0, color='black', lw=1.2)
        ax2.axhline(phi_Mn_kNm, color='red', linestyle='--', alpha=0.5, label='Kapasitas Momen ϕMn')
        ax2.invert_yaxis() 
        ax2.set_ylabel('Momen M (kNm)')
        ax2.set_title('Diagram Momen Lentur (BMD)')
        ax2.grid(True, alpha=0.3)
        ax2.legend(loc="lower right", fontsize="small")
        
        # 3. Deflection Curve
        ax3.plot(x, -deflection_mm, color='#2CA02C', lw=2.5, label='Lendutan Aktual')
        ax3.axhline(0, color='black', lw=1.2)
        ax3.axhline(-limit_deflection, color='red', linestyle='--', label='Batas Izin L/360')
        ax3.set_xlabel('Posisi di Balok (Meter)')
        ax3.set_ylabel('Lendutan (mm)')
        ax3.set_title('Bentuk Lendutan Balok Baja')
        ax3.legend(loc="lower left", fontsize="small")
        ax3.grid(True, alpha=0.3)
        
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()
        
        # Recommendations
        st.subheader("Evaluasi Desain (SNI 1729)")
        if not is_moment_safe:
            st.error(f"🚨 BAHAYA LENTUR: Momen yang terjadi ({max_moment:.1f} kNm) melebihi kapasitas penampang (ϕMn = {phi_Mn_kNm:.1f} kNm). Profil WF akan mengalami kondisi leleh (Yielding) atau tekuk. Perbesar profil baja!")
        elif not is_shear_safe:
            st.error(f"🚨 BAHAYA GESER: Gaya geser ({max_shear:.1f} kN) melebihi kekuatan pelat badan/web (ϕVn = {phi_Vn_kN:.1f} kN).")
        elif not is_deflection_safe:
            st.warning(f"⚠️ WASPADA LENDUTAN: Struktur baja kuat menahan beban, tetapi lendutannya terlalu melengkung ({max_deflection_mm:.1f} mm melebihi batas {limit_deflection:.1f} mm). Pengguna gedung akan merasa tidak nyaman/tidak aman.")
        else:
            st.success(f"✅ DESAIN AMAN: Penampang baja {profile.split(' ')[1]} dengan mutu {material.split(' ')[0]} memenuhi seluruh persyaratan kapasitas Lentur, Geser, dan Lendutan sesuai SNI 1729.")
