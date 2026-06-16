import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_hydrology():
    st.header("🌊 Bendungan Penangkal Banjir")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Saat hujan deras melanda hulu sungai, volume air raksasa akan mengalir ke arah kota (banjir bandang). Bendungan berfungsi sebagai penampung sementara air banjir tersebut dan melepasnya secara perlahan agar sungai di kota tidak meluap.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Kontrol Aliran & Pintu Air")
        curah_hujan = st.slider("Intensitas Hujan Hulu (mm/jam)", 20, 150, 80, help="Makin tinggi angka hujan, volume banjir kiriman makin besar.")
        kapasitas_dam = st.slider("Daya Tampung Waduk (Unit Volume)", 100, 1000, 500, help="Kapasitas kolam waduk bendungan untuk menyimpan air banjir.")
        bukaan_pintu = st.slider("Bukaan Pintu Air Waduk (%)", 0, 100, 30, help="Persentase bukaan pintu air bendungan untuk mengalirkan air ke sungai hilir.")
        
        st.info("""
        💡 **Panduan Manajemen Banjir:**
        * **Jika Pintu Air ditutup terlalu rapat**, air akan menumpuk di waduk dan berisiko meluap melewati puncak bendungan (overtopping) yang berakibat fatal.
        * **Jika Pintu Air dibuka terlalu lebar**, air banjir akan langsung meluncur ke hilir sungai dan membanjiri kota seketika.
        """)
        
    with col2:
        time_steps = np.arange(0, 24, 1)
        # Model Hidrograf Banjir (Inflow) berbentuk lonceng
        inflow = curah_hujan * np.exp(-((time_steps - 12) / 4)**2)
        
        # Hitung Outflow berdasarkan bukaan pintu air
        outflow_rate = (bukaan_pintu / 100) * 40
        outflow = np.minimum(inflow, outflow_rate)
        
        # Hitung volume tampungan bendungan secara akumulatif
        volume = np.zeros(len(time_steps))
        current_vol = 0
        dam_overflow = False
        
        for i in range(len(time_steps)):
            current_vol += (inflow[i] - outflow[i])
            current_vol = max(0, current_vol)
            volume[i] = current_vol
            if current_vol > kapasitas_dam:
                dam_overflow = True
                
        # Calculate key metrics
        peak_inflow = max(inflow)
        peak_outflow = max(outflow)
        flood_reduction = ((peak_inflow - peak_outflow) / peak_inflow) * 100 if peak_inflow > 0 else 0.0
        max_vol_retained = max(volume)
        
        # Display Metrics
        m1, m2, m3 = st.columns(3)
        with m1:
            st.metric("Aliran Air Masuk Maksimal", f"{peak_inflow:.1f} m³/s", help="Puncak aliran air kiriman banjir dari hulu.")
        with m2:
            st.metric("Air yang Dilepas ke Kota", f"{peak_outflow:.1f} m³/s", help="Kecepatan aliran air yang keluar menuju sungai kota.")
        with m3:
            st.metric("Banjir yang Berhasil Diredam", f"{flood_reduction:.1f}%", help="Persentase puncak banjir yang berhasil dipotong oleh bendungan.")
            
        # Plotting Grafis Hidrograf
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.plot(time_steps, inflow, label="Banjir Masuk dari Hulu (Inflow)", color='#FF4B4B', lw=2)
        ax.plot(time_steps, outflow, label="Air Keluar ke Sungai Kota (Outflow)", color='#0068C9', lw=2)
        ax.fill_between(time_steps, inflow, outflow, color='gray', alpha=0.2, label="Volume Air yang Ditahan Waduk")
        ax.set_xlabel("Waktu Simulasi (Jam)")
        ax.set_ylabel("Debit Aliran Air (m³/detik)")
        ax.legend()
        ax.grid(True, alpha=0.3)
        st.pyplot(fig)
        plt.close()
        
        # Display Volume usage
        st.progress(min(1.0, max_vol_retained / kapasitas_dam), text=f"Tampungan Waduk Terisi: {max_vol_retained:.1f} / {kapasitas_dam} unit")
        
        st.subheader("Evaluasi Status Keselamatan")
        if dam_overflow:
            st.error("🚨 BENCANA BESAR: Waduk Penuh Meluap! Air meluncur deras melewati puncak bendungan (Overtopping). Terjadi banjir bandang dahsyat di kota hilir!")
        elif max(outflow) > 35:
            st.warning("⚠️ WASPADA BANJIR: Sungai di kota hilir meluap karena debit pintu air waduk dibuka terlalu besar.")
        else:
            st.success("✅ KOTA AMAN: Bendungan berhasil memotong puncak air banjir dengan aman. Sungai di kota tetap normal di bawah tanggul sungai.")
