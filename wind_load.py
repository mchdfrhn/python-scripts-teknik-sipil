import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def get_Kz(z, exposure):
    # ASCE 7 formula parameter tables (converted to SI units)
    if "Perkotaan" in exposure:
        zg, alpha = 365.76, 7.0
        z_min = 9.14
    elif "Terbuka" in exposure:
        zg, alpha = 274.32, 9.5
        z_min = 4.57
    else: # Pantai
        zg, alpha = 213.36, 11.5
        z_min = 4.57
        
    z_calc = max(z, z_min)
    return 2.01 * (z_calc / zg)**(2.0 / alpha)

def page_wind_load():
    st.header("💨 Kekuatan Gedung Menahan Angin")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Makin tinggi suatu gedung pencakar langit dibangun, angin yang bertiup di bagian atas akan makin kencang. Dinding luar dan kaca jendela gedung harus dirancang cukup tebal agar tidak pecah akibat tekanan dorong angin badai.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Ukuran Gedung & Lokasi")
        height_m = st.slider("Tinggi Gedung H (Meter)", 10.0, 100.0, 40.0, step=5.0, help="Makin tinggi gedung, kecepatan angin di lantai atas akan meningkat pesat.")
        width_m = st.slider("Lebar Dinding Menghadap Angin (Meter)", 10.0, 100.0, 30.0, step=5.0, help="Lebar bidang dinding gedung yang ditabrak oleh angin lateral.")
        exposure = st.selectbox("Kondisi Lingkungan Sekitar", [
            "B (Perkotaan / Padat Bangunan)", 
            "C (Terbuka / Lapangan / Sawah)", 
            "D (Pantai / Rata Tanpa Penghalang)"
        ])
        
        st.markdown("---")
        st.subheader("Kekuatan Angin")
        V_wind = st.slider("Kecepatan Angin Dasar (m/detik)", 20, 60, 35, step=5, help="Kecepatan angin badai ekstrim di lokasi proyek (35 m/s ≈ 126 km/jam).")
        
        st.markdown("---")
        st.subheader("Faktor Desain Standar")
        Kd = 0.85 # Wind Directionality Factor
        Kzt = 1.00 # Topographic Factor
        G_gust = 0.85 # Gust Effect Factor
        Cp = 0.80 # Windward external pressure coefficient
        
        st.info("""
        💡 **Info Angin untuk Awam:**
        * **Kategori Perkotaan (B)** memiliki banyak gedung lain sebagai penghalang, sehingga tekanan angin cenderung diredam.
        * **Kategori Pantai (D)** tidak memiliki penghalang sama sekali, sehingga tiupan angin langsung menabrak dinding gedung dengan kekuatan penuh.
        """)
        
    with col2:
        # Generate height steps (0 to building height H)
        n_steps = 50
        z_steps = np.linspace(0, height_m, n_steps)
        dz = height_m / (n_steps - 1)
        
        # Calculate velocity pressure q_z & windward pressure p_z for each height
        # q_z = 0.613 * Kz * Kzt * Kd * V^2 * 10^-3 (to convert Pa to kPa)
        q_z = []
        p_z = []
        
        for z in z_steps:
            Kz = get_Kz(z, exposure)
            qz = 0.613 * Kz * Kzt * Kd * (V_wind**2) * 0.001 # kPa
            pz = qz * G_gust * Cp # kPa
            q_z.append(qz)
            p_z.append(pz)
            
        p_z = np.array(p_z)
        
        # Max values at top of building
        max_qz = q_z[-1]
        max_pz = p_z[-1]
        
        # Calculate Total Wind Force (Base Shear) in kN
        # Integrate pressure * width over height: F_base = sum(p_z_i * width * dz)
        total_wind_force = np.sum(p_z * width_m * dz)
        
        # Display Metrics
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Tekanan Angin di Atap", f"{max_qz:.3f} kPa", help="Tekanan dinamis angin di titik tertinggi gedung.")
        with m2:
            st.metric("Tekanan Maks pada Dinding", f"{max_pz:.3f} kPa", help="Beban angin tekan bersih per meter persegi dinding kaca teratas.")
        with m3:
            st.metric("Total Gaya Dorong Angin", f"{total_wind_force:.1f} kN", help="Gaya total yang mendorong gedung ke samping (10 kN ≈ 1 Ton).")
            
        # Plotting Pressure Profile vs Height
        fig, ax = plt.subplots(figsize=(6, 4))
        ax.plot(p_z, z_steps, color='#FF4B4B', lw=2.5, label='Tekanan Desain Angin')
        ax.fill_betweenx(z_steps, 0, p_z, color='#FF4B4B', alpha=0.15)
        ax.set_ylabel('Tinggi Bangunan (Meter)')
        ax.set_xlabel('Tekanan Angin Rencana p (kPa)')
        ax.set_title('Distribusi Tekanan Angin vs Tinggi Gedung')
        ax.grid(True, linestyle=':', alpha=0.5)
        ax.legend()
        st.pyplot(fig)
        plt.close()
        
        # Engineering insights
        st.subheader("Evaluasi Keamanan Dinding & Kaca")
        st.write(f"Lokasi Gedung: **{exposure}**")
        st.write(f"Tekanan tiup angin maksimal pada kaca jendela teratas: **{max_pz:.2f} kN/m²** (~{max_pz * 100:.1f} kg beban per meter persegi kaca).")
        st.write(f"Total gaya dorong angin ke samping pada seluruh permukaan gedung: **{total_wind_force:.1f} kN** (~{total_wind_force / 9.81:.1f} Ton gaya lateral).")
        
        if max_pz > 1.2:
            st.error("🚨 TEKANAN ANGIN SANGAT KENCANG: Beban angin sangat tinggi! Sambungan dinding panel luar dan kaca jendela harus didesain ekstra tebal dan kuat agar tidak pecah/terlepas tersapu badai. Struktur utama gedung juga membutuhkan dinding geser beton (shear wall) penahan beban samping.")
        elif max_pz > 0.6:
            st.warning("⚠️ TEKANAN ANGIN SEDANG: Cocok untuk konstruksi gedung perkantoran biasa. Pastikan kusen jendela luar memiliki sambungan yang memadai.")
        else:
            st.success("✅ TEKANAN ANGIN AMAN: Tekanan angin rendah. Struktur dinding luar dan kaca jendela aman menggunakan perancangan standar.")
