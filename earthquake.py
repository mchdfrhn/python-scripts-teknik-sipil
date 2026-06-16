import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import time

def page_earthquake():
    st.header("🏗️ Simulasi Gedung Tahan Gempa")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Saat gempa bumi terjadi, tanah akan bergoyang ke samping. Gedung bertingkat harus dirancang fleksibel tetapi kokoh agar goyangan tersebut tidak meruntuhkan tiang penopang bangunan. Mari uji seberapa kuat pilihan struktur bangunan Anda!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Pengaturan Bangunan & Gempa")
        tinggi = st.slider("Tinggi Gedung (Jumlah Lantai)", 3, 20, 10, key="eq_tinggi", help="Makin tinggi gedung, goyangan di lantai atas akan makin terasa.")
        material = st.selectbox("Bahan Utama Struktur", [
            "Beton Biasa (Tanpa Besi Tulangan)", 
            "Beton Bertulang (Standar Gedung Modern)", 
            "Rangka Baja & Peredam Goyangan (Teknologi Canggih)"
        ])
        magnitudo = st.slider("Kekuatan Gempa (Skala Richter)", 1.0, 10.0, 6.0, step=0.5, help="Skala kekuatan gempa bumi yang terjadi di bawah tanah.")
        
        st.info("""
        💡 **Info Sipil untuk Awam:**
        * **Beton Biasa** sangat rapuh saat ditarik/digoyang ke samping (mudah patah).
        * **Beton Bertulang** menggunakan besi di dalamnya untuk menahan gaya tarik saat digoyang.
        * **Peredam Goyangan** bertindak seperti suspensi mobil yang menyerap energi getaran gempa.
        """)
        
    # Set damping and stiffness parameters based on material choice
    if material == "Beton Biasa (Tanpa Besi Tulangan)":
        damping = 0.02  # Sangat rendah meredam
        kekakuan = 15.0 # Kaku tapi rapuh
    elif material == "Beton Bertulang (Standar Gedung Modern)":
        damping = 0.07  # Cukup baik meredam
        kekakuan = 10.0 # Elastisitas sedang
    else:
        damping = 0.25  # Meredam sangat cepat
        kekakuan = 5.0  # Sangat fleksibel & aman
    
    with col2:
        plot_placeholder = st.empty()
        status_placeholder = st.empty()
        
        # Helper function to plot building
        def plot_building(amplitude_t, t_val=0):
            fig, ax = plt.subplots(figsize=(5, 6))
            ax.axhline(0, color='black', lw=3)
            
            y_coords = np.linspace(0, tinggi * 3, tinggi + 1)
            # Deflection curve shape: quadratic distribution over height
            x_coords = amplitude_t * (y_coords / y_coords[-max(1, int(tinggi/2))])**2
            
            offset = 1.5
            # Draw left column, right column, and floor slabs
            ax.plot(x_coords - offset, y_coords, color='#FF4B4B', lw=4, marker='o', label="Tiang Kiri Gedung")
            ax.plot(x_coords + offset, y_coords, color='#FF4B4B', lw=4, marker='o', label="Tiang Kanan Gedung")
            for y_val, x_val in zip(y_coords, x_coords):
                ax.plot([x_val - offset, x_val + offset], [y_val, y_val], color='gray', linestyle='--', alpha=0.5)
            
            ax.set_xlim(-15, 15)
            ax.set_ylim(-1, (tinggi * 3) + 5)
            ax.set_xlabel("Simpangan / Geser Goyangan (Meter)")
            ax.set_ylabel("Tinggi Gedung (Meter)")
            ax.set_title(f"Goyangan Gedung Saat Gempa (Waktu: {t_val:.2f} detik)")
            ax.grid(True, linestyle=':', alpha=0.6)
            ax.legend()
            return fig
            
        # Draw initial static state
        fig_init = plot_building(0.0, 0.0)
        plot_placeholder.pyplot(fig_init)
        plt.close(fig_init)
        status_placeholder.info("💡 Klik tombol di bawah untuk menyimulasikan getaran gempa pada gedung.")
        
        if st.button("🚀 MULAI SIMULASI GEMPA", use_container_width=True):
            t_steps = np.linspace(0, 8, 40)
            
            for t in t_steps:
                # Calculate movement based on physics formulas (damped sine wave)
                amplitude = (magnitudo * (kekakuan / 10)) * np.exp(-damping * t) * np.sin(2 * np.pi * 0.5 * t)
                fig = plot_building(amplitude, t)
                plot_placeholder.pyplot(fig)
                plt.close(fig)
                
                # Check structural failure thresholds
                if abs(amplitude) > 6.0 and material == "Beton Biasa (Tanpa Besi Tulangan)":
                    status_placeholder.error(f"🚨 BAHAYA BESAR: Gedung runtuh total pada detik ke-{t:.2f}! Beton biasa langsung pecah karena tidak mampu menahan gaya tarik saat bergoyang (Simpangan maksimal = {abs(amplitude):.2f} meter)!")
                    break
                elif abs(amplitude) > 4.0:
                    status_placeholder.warning(f"⚠️ KERUSAKAN STRUKTUR: Tiang beton mengalami retak-retak parah pada detik ke-{t:.2f} (Simpangan = {abs(amplitude):.2f} meter). Gedung masih berdiri namun tidak aman dihuni.")
                else:
                    status_placeholder.success(f"✅ GEDUNG AMAN: Struktur bergoyang secara aman dan getaran diredam dengan cepat (Simpangan aman = {abs(amplitude):.2f} meter).")
                time.sleep(0.04)
