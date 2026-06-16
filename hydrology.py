import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

def page_hydrology():
    st.header("🌧️ Analisis Debit Banjir (Metode Rasional SNI 2415)")
    st.write("Menghitung Debit Puncak (Peak Discharge, $Q$) dan mensimulasikan Hidrograf Sintetis berdasarkan Intensitas Hujan, Luas DAS, dan Koefisien Limpasan (Tutupan Lahan).")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Data Daerah Aliran Sungai")
        rain_intensity = st.slider("Intensitas Hujan, I (mm/jam)", 20.0, 300.0, 100.0, step=10.0)
        area = st.slider("Luas DAS, A (km²)", 1.0, 50.0, 10.0, step=1.0)
        
        c_opts = {
            "0.90 - Perkotaan / Aspal Padat": 0.9,
            "0.70 - Permukiman / Perumahan": 0.7,
            "0.30 - Lahan Kosong / Pertanian": 0.3,
            "0.10 - Hutan Lebat": 0.1
        }
        runoff_label = st.selectbox("Tutupan Lahan (Koefisien Limpasan, C)", list(c_opts.keys()))
        runoff_coef = c_opts[runoff_label]
        
        # Rational Method Calculation
        peak_discharge = 0.278 * runoff_coef * rain_intensity * area
        
        st.info(r"""
        **Rumus Rasional:**
        $Q = 0.278 \cdot C \cdot I \cdot A$
        $Q$ = {peak_discharge:.1f} m³/s
        """.format(peak_discharge=peak_discharge))
        
    with col2:
        # Synthetic Hydrograph
        time_hours = np.arange(0, 24, 1)
        time_to_peak = 4
        
        hydrograph = []
        for t in time_hours:
            if t == 0:
                hydrograph.append(0)
            elif t <= time_to_peak:
                hydrograph.append(peak_discharge * ((t / time_to_peak) ** 2.4))
            else:
                hydrograph.append(peak_discharge * np.exp(-0.3 * (t - time_to_peak)))
                
        total_vol = sum(hydrograph) * 3600 / 1000 # Ribu m3
        
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.plot(time_hours, hydrograph, color='#ef4444', linewidth=2, label="Debit Aliran (Q)")
        ax.fill_between(time_hours, hydrograph, color='#ef4444', alpha=0.2)
        ax.set_xlabel("Waktu (Jam)")
        ax.set_ylabel("Debit (m³/s)")
        ax.set_title("Hidrograf Banjir Sintetis")
        ax.grid(True, linestyle='--', alpha=0.6)
        ax.legend()
        
        st.pyplot(fig)
        
        st.metric("Total Volume Limpasan", f"{total_vol:.1f} Ribu m³")
        
        if peak_discharge > 100:
            st.error(f"🚨 BAHAYA BANJIR BANDANG: Debit sangat besar ({peak_discharge:.1f} m³/s). Diperlukan bendungan pengendali banjir skala besar.")
        elif peak_discharge > 40:
            st.warning(f"⚠️ WASPADA BANJIR: Debit puncak tinggi ({peak_discharge:.1f} m³/s). Normalisasi sungai dan pembuatan polder wajib dilakukan.")
        else:
            st.success(f"✅ AMAN: Debit puncak ({peak_discharge:.1f} m³/s). Saluran drainase standar masih mampu menampung.")
