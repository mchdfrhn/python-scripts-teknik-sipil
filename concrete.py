import streamlit as st
import matplotlib.pyplot as plt

def page_concrete():
    st.header("🧱 Peracik Campuran Beton (ACI 211.1 / SNI 7656)")
    st.write("Metode *Absolute Volume* untuk menentukan proporsi material penyusun beton berdasarkan target kuat tekan ($f'_c$) dan persentase abu batubara (Fly Ash).")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Parameter Mix Design")
        target_strength = st.slider("Target Kuat Tekan (f'c) [MPa]", 20, 45, 30, step=5)
        fly_ash_percent = st.slider("Substitusi Fly Ash (%)", 0, 50, 15, help="Mengganti semen dengan abu batubara untuk mengurangi emisi karbon.")
        
        # ACI 211.1 / SNI 7656 Calculations
        water = 200.0 # kg/m3 (asumsi agregat 20mm, slump 75-100mm)
        air_volume = 0.02 # 2% udara
        
        if target_strength >= 40:
            wc_ratio = 0.43
        elif target_strength >= 30:
            wc_ratio = 0.54
        elif target_strength >= 25:
            wc_ratio = 0.60
        else:
            wc_ratio = 0.70
            
        total_cementitious = water / wc_ratio
        fly_ash_mass = total_cementitious * (fly_ash_percent / 100.0)
        cement_mass = total_cementitious - fly_ash_mass
        
        sg_cement = 3.15
        sg_flyash = 2.20
        sg_agg = 2.60
        
        coarse_agg = 992.0 # kg
        
        vol_water = water / 1000.0
        vol_cement = cement_mass / (sg_cement * 1000.0)
        vol_flyash = fly_ash_mass / (sg_flyash * 1000.0)
        vol_coarse = coarse_agg / (sg_agg * 1000.0)
        
        vol_sand = 1.0 - (vol_water + vol_cement + vol_flyash + vol_coarse + air_volume)
        fine_agg = vol_sand * (sg_agg * 1000.0)
        
        # Emisi CO2
        co2_standard = total_cementitious * 0.9
        co2_eco = (cement_mass * 0.9) + (fly_ash_mass * 0.02)
        co2_reduction = ((co2_standard - co2_eco) / co2_standard) * 100
        
        st.info(f"**Rasio Air/Semen (w/c):** {wc_ratio:.2f}\n\n**Pengurangan Emisi CO2:** {co2_reduction:.1f}%")
        
    with col2:
        st.subheader("Proporsi Material (kg per m³)")
        
        labels = ['Semen', 'Fly Ash', 'Air', 'Pasir', 'Kerikil']
        sizes = [cement_mass, fly_ash_mass, water, fine_agg, coarse_agg]
        colors = ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b', '#64748b']
        explode = (0.1, 0.1, 0, 0, 0)
        
        fig, ax = plt.subplots()
        ax.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
               shadow=True, startangle=90)
        ax.axis('equal')
        
        st.pyplot(fig)
        
        st.write("### Rekapitulasi Berat:")
        st.write(f"- **Semen Portland:** {cement_mass:.1f} kg")
        st.write(f"- **Abu Batubara:** {fly_ash_mass:.1f} kg")
        st.write(f"- **Air:** {water:.1f} kg")
        st.write(f"- **Pasir (Agregat Halus):** {fine_agg:.1f} kg")
        st.write(f"- **Kerikil (Agregat Kasar):** {coarse_agg:.1f} kg")
        
        if fly_ash_percent > 35:
            st.error("🚨 BAHAYA: Fly ash melebihi 35%. Kekuatan awal beton akan sangat rendah dan waktu ikat terlalu lama.")
        elif fly_ash_percent > 20:
            st.warning("⚠️ WASPADA: Penggunaan Fly Ash tinggi (High Volume Fly Ash Concrete). Perawatan basah harus ketat minimal 14 hari.")
        else:
            st.success("✅ Campuran memenuhi standar proporsi. Siap untuk *trial mix*.")
