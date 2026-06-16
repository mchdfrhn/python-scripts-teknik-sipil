import streamlit as st
import numpy as np
import matplotlib.pyplot as plt
import time

def page_earthquake():
    st.header("🏗️ Simulasi Gempa Gedung (SNI 1726)")
    st.write("""
    **Analisis Statik Ekuivalen Berdasarkan SNI 1726:2019**  
    Simulasi ini menghitung Gaya Geser Dasar Seismik ($V$) dan Simpangan Atap Maksimal (Roof Drift) menggunakan parameter respons spektrum, Sistem Penahan Gaya Seismik ($R$), dan mengecek batasan izin simpangan bangunan.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Parameter Gedung & Gempa")
        tinggi = st.slider("Jumlah Lantai Gedung", 3, 20, 10, key="eq_tinggi", help="Tinggi asumsi per lantai adalah 4 meter.")
        material = st.selectbox("Sistem Penahan Gaya Seismik", [
            "Rangka Beton Pemikul Momen Khusus (SRPMK, R=8)",
            "Rangka Beton Pemikul Momen Menengah (SRPMM, R=5)",
            "Rangka Beton Pemikul Momen Biasa (SRPMB, R=3)" 
        ])
        
        magnitudo_slider = st.slider("Kekuatan Gempa (Setara Percepatan SDS)", 1.0, 10.0, 6.0, step=0.5, help="Angka simulasi ini akan dipetakan ke nilai Spektrum Respons Desain (SDS).")
        
        # Mapping properties
        if "SRPMK" in material:
            R = 8.0
            Cd = 5.5
            damping = 0.05
        elif "SRPMM" in material:
            R = 5.0
            Cd = 4.5
            damping = 0.05
        else:
            R = 3.0
            Cd = 2.5
            damping = 0.05
            
        Sds = (magnitudo_slider / 10.0) * 1.5 # 0.15g to 1.5g
        Ie = 1.0 # Faktor Keutamaan
        
        st.info(f"""
        💡 **Parameter Analisis:**
        * **SDS** = {Sds:.2f} g
        * **Faktor Modifikasi (R)** = {R}
        * **Faktor Pembesaran (Cd)** = {Cd}
        """)
        
    with col2:
        plot_placeholder = st.empty()
        status_placeholder = st.empty()
        
        # SNI 1726 Calculations
        floor_height = 4.0
        hn = tinggi * floor_height
        W = tinggi * 2500.0 # kN
        
        Cs = Sds / (R / Ie)
        if Cs < 0.044 * Sds * Ie:
            Cs = 0.044 * Sds * Ie
            
        V_base = Cs * W
        
        # Empirical approximation for demonstration
        Delta_elastic = (Cs * hn) / 20.0 
        max_drift = (Cd * Delta_elastic) / Ie
        allowable_drift = 0.020 * hn
        
        # For animation physics
        T_period = 0.0466 * (hn ** 0.9)
        freq = 1.0 / T_period
        
        def plot_building(amplitude_t, t_val=0):
            fig, ax = plt.subplots(figsize=(5, 6))
            ax.axhline(0, color='black', lw=3)
            
            y_coords = np.linspace(0, hn, tinggi + 1)
            # Mode shape approximation: y^1.5
            x_coords = amplitude_t * ((y_coords / hn) ** 1.5)
            
            offset = 2.0
            # Draw columns and floor slabs
            ax.plot(x_coords - offset, y_coords, color='#0068C9', lw=4, marker='o')
            ax.plot(x_coords + offset, y_coords, color='#0068C9', lw=4, marker='o')
            for y_val, x_val in zip(y_coords, x_coords):
                ax.plot([x_val - offset, x_val + offset], [y_val, y_val], color='gray', linestyle='-', alpha=0.8, lw=3)
            
            ax.set_xlim(-10, 10)
            ax.set_ylim(-1, hn + 5)
            ax.set_xlabel("Simpangan Atap (Meter)")
            ax.set_ylabel("Tinggi Gedung (Meter)")
            ax.set_title(f"Goyangan Gempa | t = {t_val:.2f}s | Base Shear = {V_base:.0f} kN")
            ax.grid(True, linestyle=':', alpha=0.6)
            return fig
            
        # Draw initial static state
        fig_init = plot_building(0.0, 0.0)
        plot_placeholder.pyplot(fig_init)
        plt.close(fig_init)
        
        status_placeholder.info(f"👉 Klik tombol untuk melihat respon struktur. Batas izin simpangan SNI: **{allowable_drift:.2f} meter**.")
        
        if st.button("🚀 MULAI SIMULASI GEMPA (SNI 1726)", use_container_width=True):
            t_steps = np.linspace(0, 8, 40)
            
            for t in t_steps:
                # Envelope: damped harmonic
                amplitude = max_drift * np.exp(-damping * 2.0 * t) * np.sin(2 * np.pi * freq * t)
                
                fig = plot_building(amplitude, t)
                plot_placeholder.pyplot(fig)
                plt.close(fig)
                
                # Dynamic feedback
                if max_drift > allowable_drift * 1.5:
                    status_placeholder.error(f"🚨 BAHAYA RUNTUH: Simpangan Atap ({max_drift:.2f}m) sangat melebihi batas izin ({allowable_drift:.2f}m). Sistem {material.split('(')[1].split(',')[0]} GAGAL MENAHAN GEMPA!")
                    break
                elif max_drift > allowable_drift:
                    status_placeholder.warning(f"⚠️ TIDAK MEMENUHI SNI: Simpangan Atap ({max_drift:.2f}m) melampaui batas izin ({allowable_drift:.2f}m). Kolom retak parah.")
                else:
                    status_placeholder.success(f"✅ MEMENUHI SNI 1726: Simpangan Atap ({max_drift:.2f}m) AMAN di bawah batas izin ({allowable_drift:.2f}m). Struktur Daktail!")
                time.sleep(0.05)
