import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_steel_beam():
    st.header("🌉 Kelenturan Jembatan & Balok")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Saat jembatan atau balok bangunan dilewati kendaraan berat, baja tersebut akan melengkung (lentur) ke bawah. Jika kelengkungan tersebut terlalu besar, struktur jembatan bisa patah atau retak. Mari uji seberapa besar kelengkungan balok baja Anda di bawah berat beban!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Konfigurasi Balok Jembatan")
        L = st.slider("Panjang Jembatan / Balok (Meter)", 2.0, 12.0, 6.0, step=0.5, help="Panjang bentang bebas balok tanpa tiang penyangga di tengah.")
        load_type = st.selectbox("Tipe Penempatan Beban", [
            "Beban Merata (Contoh: Antrean Kendaraan)", 
            "Beban Terpusat di Tengah (Contoh: Truk Berat Tunggal)"
        ])
        
        if "Beban Merata" in load_type:
            w = st.slider("Berat Beban Merata (kN/m)", 1.0, 50.0, 15.0, step=1.0, help="Berat beban yang tersebar di sepanjang jembatan (1 kN ≈ 100 kg).")
            P = 0
        else:
            P = st.slider("Berat Beban Terpusat (kN)", 5.0, 200.0, 50.0, step=5.0, help="Satu beban berat tunggal tepat di tengah jembatan (50 kN ≈ 5 Ton).")
            w = 0
            
        st.markdown("---")
        st.subheader("Spesifikasi Balok Baja")
        profile = st.selectbox("Pilihan Ukuran Balok Baja (Standar IPE)", ["Balok Kecil (IPE 200)", "Balok Sedang (IPE 300)", "Balok Besar (IPE 400)", "Ukuran Kustom"])
        
        # Steel Modulus of Elasticity (E) in GPa (converted to kN/m2)
        E = 200e9 / 1e3 # 200,000,000 kN/m2 (or 200 GPa)
        
        if profile == "Balok Kecil (IPE 200)":
            Ix_cm4 = 1943.0
            depth_mm = 200.0
        elif profile == "Balok Sedang (IPE 300)":
            Ix_cm4 = 8356.0
            depth_mm = 300.0
        elif profile == "Balok Besar (IPE 400)":
            Ix_cm4 = 23130.0
            depth_mm = 400.0
        else:
            Ix_cm4 = st.slider("Kekakuan Penampang / Momen Inersia Ix (cm⁴)", 500, 50000, 5000, help="Makin tinggi angka ini, balok baja makin kaku dan susah melengkung.")
            depth_mm = st.slider("Tinggi Penampang Baja (mm)", 100, 600, 250)
            
        # Convert Ix from cm4 to m4
        Ix_m4 = Ix_cm4 * 1e-8
        
        limit_ratio = st.selectbox("Batas Melengkung Aman", ["L / 240 (Standar Bangunan Umum)", "L / 360 (Standar Jembatan Kereta / Kaku)"])
        limit_val = 240.0 if "240" in limit_ratio else 360.0
        delta_allowable_mm = (L * 1000) / limit_val
        
    with col2:
        x = np.linspace(0, L, 100)
        
        # Calculations
        if "Beban Merata" in load_type:
            Ra = Rb = (w * L) / 2
            shear = Ra - w * x
            moment = Ra * x - (w * x**2) / 2
            # Deflection formula: y(x) = w * x / (24 * E * I) * (L^3 - 2*L*x^2 + x^3)
            deflection_m = (w * x) / (24 * E * Ix_m4) * (L**3 - 2 * L * x**2 + x**3)
            deflection_mm = deflection_m * 1000
            max_deflection_mm = (5 * w * L**4) / (384 * E * Ix_m4) * 1000
            max_moment = (w * L**2) / 8
            max_shear = Ra
        else:
            Ra = Rb = P / 2
            shear = np.where(x <= L/2, Ra, -Rb)
            moment = np.where(x <= L/2, Ra * x, Rb * (L - x))
            
            # Point load deflection
            deflection_mm = np.zeros(len(x))
            for i, xi in enumerate(x):
                if xi <= L/2:
                    deflection_mm[i] = (P * xi) / (48 * E * Ix_m4) * (3 * L**2 - 4 * xi**2) * 1000
                else:
                    x_mirror = L - xi
                    deflection_mm[i] = (P * x_mirror) / (48 * E * Ix_m4) * (3 * L**2 - 4 * x_mirror**2) * 1000
            
            max_deflection_mm = (P * L**3) / (48 * E * Ix_m4) * 1000
            max_moment = (P * L) / 4
            max_shear = Ra
            
        # Metrics Display
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Gaya Gunting Maksimal", f"{max_shear:.1f} kN", help="Gaya geser internal yang merobek balok secara vertikal.")
        with m2:
            st.metric("Momen Bengkok Maksimal", f"{max_moment:.1f} kNm", help="Beban putar internal yang menekuk balok.")
        with m3:
            st.metric("Kelengkungan Balok Tengah", f"{max_deflection_mm:.2f} mm",
                      delta=f"Batas Aman: {delta_allowable_mm:.1f} mm",
                      delta_color="inverse" if max_deflection_mm > delta_allowable_mm else "normal")
            
        # Plotting 3 diagrams (SFD, BMD, Deflection)
        fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(6, 8.5), sharex=True)
        
        # 1. Shear Force Diagram
        ax1.plot(x, shear, color='#0068C9', lw=2)
        ax1.fill_between(x, shear, color='#0068C9', alpha=0.15)
        ax1.axhline(0, color='black', lw=1.2)
        ax1.set_ylabel('Gaya Gunting V (kN)')
        ax1.set_title('Diagram Gaya Gunting / Geser (SFD)')
        ax1.grid(True, alpha=0.3)
        
        # 2. Bending Moment Diagram
        ax2.plot(x, moment, color='#FF4B4B', lw=2)
        ax2.fill_between(x, moment, color='#FF4B4B', alpha=0.15)
        ax2.axhline(0, color='black', lw=1.2)
        ax2.invert_yaxis()  # Standard civil engineering plot shows tension face (bottom) positive
        ax2.set_ylabel('Momen M (kNm)')
        ax2.set_title('Diagram Beban Bengkok / Momen (BMD)')
        ax2.grid(True, alpha=0.3)
        
        # 3. Deflection Curve
        ax3.plot(x, -deflection_mm, color='#2CA02C', lw=2.5, label='Kelengkungan Balok')
        ax3.axhline(0, color='black', lw=1.2)
        ax3.axhline(-delta_allowable_mm, color='red', linestyle='--', label='Batas Aman Kelengkungan')
        ax3.set_xlabel('Posisi di Balok Jembatan (Meter)')
        ax3.set_ylabel('Lendutan ke Bawah (mm)')
        ax3.set_title('Bentuk Lengkungan Balok Baja')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        plt.tight_layout()
        st.pyplot(fig)
        plt.close()
        
        # Recommendations
        st.subheader("Evaluasi Status Kekokohan")
        if max_deflection_mm > delta_allowable_mm:
            st.error(f"🚨 BALOK BENGKOK BERLEBIHAN: Lendutan yang terjadi ({max_deflection_mm:.2f} mm) MELEBIHI batas aman yang diijinkan ({delta_allowable_mm:.2f} mm). Bahaya retak atau ambruk! Solusi: Gunakan profil baja yang lebih besar, kurangi panjang balok jembatan, atau batasi berat kendaraan.")
        else:
            st.success(f"✅ BENTANG BALOK AMAN: Lendutan balok ({max_deflection_mm:.2f} mm) masih di bawah batas kelengkungan aman ({delta_allowable_mm:.2f} mm). Jembatan Anda kokoh untuk dilewati!")
