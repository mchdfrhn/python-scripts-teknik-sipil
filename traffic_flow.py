import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_traffic_flow():
    st.header("🚦 Kalkulator Kemacetan Jalan")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Pernahkah Anda terjebak macet berjam-jam dan bertanya-tanya mengapa hal itu terjadi? Kemacetan terjadi ketika jumlah mobil yang lewat melebihi daya tampung jalan raya (Kapasitas). Faktor seperti lebar jalan, pejalan kaki, angkot ngetem, dan parkir liar sangat memengaruhi kelancaran jalan. Mari uji kapasitas jalan raya Anda!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Ukuran Jalan Raya")
        N_lanes = st.slider("Jumlah Lajur Jalan (Satu Arah)", 1, 4, 2, help="Berapa banyak mobil yang bisa berjalan sejajar ke satu arah.")
        lane_width = st.slider("Lebar Tiap Lajur Jalan (Meter)", 3.0, 4.5, 3.5, step=0.1, help="Lebar lajur standar jalan nasional adalah 3.5 meter. Lajur sempit memperlambat laju kendaraan.")
        
        st.markdown("---")
        st.subheader("Hambatan di Pinggir Jalan")
        side_friction = st.selectbox("Aktivitas Hambatan Samping", [
            "Sangat Rendah (Jalan Tol / Bebas Hambatan)", 
            "Rendah (Sedikit pejalan kaki & mobil parkir)", 
            "Sedang (Banyak angkot berhenti & pejalan kaki menyeberang)", 
            "Tinggi (Pertokoan ramai, parkir liar di bahu jalan)", 
            "Sangat Tinggi (Pasar tumpah jalan raya, aktivitas padat)"
        ])
        city_pop = st.selectbox("Jumlah Penduduk Kota", [
            "Kota Kecil (< 100.000 Penduduk)", 
            "Kota Sedang (100.000 - 500.000)", 
            "Kota Besar (500.000 - 1.000.000)", 
            "Metropolitan (> 1.000.000 Penduduk)"
        ])
        
        st.markdown("---")
        st.subheader("Arus Kendaraan")
        volume = st.number_input(
            "Jumlah Mobil Lewat per Jam (smp/jam)", 
            min_value=100, 
            max_value=8000, 
            value=1500, 
            step=100,
            help="smp = Satuan Mobil Penumpang. Mobil = 1 smp, Motor = 0.25 smp, Bus/Truk = 1.3 smp."
        )
        
        st.info("""
        💡 **Info Lalu Lintas:**
        * Jalan dengan hambatan samping tinggi (seperti pasar tumpah) akan mengalami penurunan kapasitas jalan secara drastis hingga 30%!
        """)
        
    with col2:
        # Base Capacity per lane (smp/jam)
        C0 = 1650.0 # Standard base capacity for flat terrain per lane (MKJI 1997)
        
        # Correction factors
        # 1. Lane width adjustment
        if lane_width < 3.25:
            FCw = 0.92
        elif lane_width < 3.75:
            FCw = 1.00
        elif lane_width < 4.25:
            FCw = 1.08
        else:
            FCw = 1.15
            
        # 2. Side Friction adjustment
        sf_dict = {
            "Sangat Rendah (Jalan Tol / Bebas Hambatan)": 0.97,
            "Rendah (Sedikit pejalan kaki & mobil parkir)": 0.93,
            "Sedang (Banyak angkot berhenti & pejalan kaki menyeberang)": 0.88,
            "Tinggi (Pertokoan ramai, parkir liar di bahu jalan)": 0.82,
            "Sangat Tinggi (Pasar tumpah jalan raya, aktivitas padat)": 0.73
        }
        FCsf = sf_dict[side_friction]
        
        # 3. City size adjustment
        cs_dict = {
            "Kota Kecil (< 100.000 Penduduk)": 0.82,
            "Kota Sedang (100.000 - 500.000)": 0.90,
            "Kota Besar (500.000 - 1.000.000)": 0.95,
            "Metropolitan (> 1.000.000 Penduduk)": 1.00
        }
        FCcs = cs_dict[city_pop]
        
        # Total Capacity
        capacity = C0 * N_lanes * FCw * FCsf * FCcs
        
        # Degree of Saturation (DS)
        DS = volume / capacity
        
        # Determine LOS
        if DS <= 0.20:
            los = "A"
            los_color = "#2CA02C" # Green
            los_desc = "Sangat Lancar: Kendaraan melaju tanpa halangan, pengemudi bebas memilih kecepatan."
        elif DS <= 0.44:
            los = "B"
            los_color = "#98DF8A" # Light Green
            los_desc = "Lancar Terkendali: Kecepatan mulai sedikit terpengaruh kendaraan lain, tetapi masih sangat longgar."
        elif DS <= 0.74:
            los = "C"
            los_color = "#FFBB78" # Light Orange
            los_desc = "Mulai Ramai: Aliran stabil, tetapi pengemudi harus lebih berhati-hati karena jarak antar kendaraan makin dekat."
        elif DS <= 0.89:
            los = "D"
            los_color = "#FF7F0E" # Orange
            los_desc = "Padat Merayap: Kecepatan menurun cukup drastis, pengendara mulai merasakan ketidaknyamanan berlalulintas."
        elif DS <= 1.00:
            los = "E"
            los_color = "#FF4B4B" # Light Red
            los_desc = "Sangat Padat: Volume kendaraan mendekati kapasitas jalan raya. Kecepatan sangat lambat dan berisiko berhenti."
        else:
            los = "F"
            los_color = "#D62728" # Crimson Red
            los_desc = "Macet Total: Kendaraan mengantre panjang secara terputus-putus. Kecepatan berjalan sangat lambat."
            
        # Metrics Display
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Daya Tampung Maksimal Jalan (Kapasitas C)", f"{capacity:.0f} smp/jam", help="Jumlah maksimal kendaraan sejenis mobil yang bisa ditampung jalan per jam.")
        with m2:
            st.metric("Tingkat Kepadatan Jalan (DS = V/C)", f"{DS:.2f}", help="Rasio jumlah mobil lewat dibanding kapasitas jalan. Nilai di atas 0.85 dianggap rawan macet.")
            
        # Display LOS box with color
        st.markdown(f"""
        <div style='text-align: center; border-radius: 8px; background-color: {los_color}22; border: 2px solid {los_color}; padding: 0.8rem; margin-bottom: 1.5rem;'>
            <h3 style='margin:0;color:{los_color};'>Tingkat Pelayanan Jalan: LOS {los}</h3>
            <p style='margin: 5px 0 0 0; color: #333; font-weight: bold;'>{los_desc}</p>
        </div>
        """, unsafe_allow_html=True)
            
        # Visualizing Saturation levels using horizontal indicator
        fig, ax = plt.subplots(figsize=(6, 2.2))
        
        # Draw colored background zones for LOS
        ax.axvspan(0, 0.20, color='#2CA02C', alpha=0.3, label="LOS A (Sangat Lancar)")
        ax.axvspan(0.20, 0.44, color='#98DF8A', alpha=0.3, label="LOS B")
        ax.axvspan(0.44, 0.74, color='#FFBB78', alpha=0.3, label="LOS C")
        ax.axvspan(0.74, 0.89, color='#FF7F0E', alpha=0.3, label="LOS D (Mulai Padat)")
        ax.axvspan(0.89, 1.00, color='#FF4B4B', alpha=0.3, label="LOS E")
        ax.axvspan(1.00, 1.50, color='#D62728', alpha=0.3, label="LOS F (Macet)")
        
        # Plot pointer for current DS
        pointer_ds = min(DS, 1.45)
        ax.axvline(pointer_ds, color='black', lw=3.5, linestyle='-')
        ax.plot(pointer_ds, 0.5, 'ko', markersize=10)
        ax.annotate(f"Kepadatan: {DS:.2f}", xy=(pointer_ds, 0.8), xytext=(pointer_ds, 1.3),
                    arrowprops=dict(facecolor='black', shrink=0.05, width=1.5, headwidth=6),
                    ha='center', fontweight='bold')
                    
        ax.set_xlim(0, 1.5)
        ax.set_ylim(0, 1.6)
        ax.set_xlabel("Rasio Kepadatan Jalan (Volume / Kapasitas)")
        ax.get_yaxis().set_visible(False)
        ax.set_title("Status Kepadatan Lajur Jalan Raya")
        ax.grid(True, axis='x', linestyle=':', alpha=0.5)
        st.pyplot(fig)
        plt.close()
        
        # Recommendations
        st.subheader("Rekomendasi Manajemen Rekayasa")
        if DS > 0.85:
            st.error("🚨 REKOMENDASI KRITIS: Jalan raya sudah melebihi batas tampung aman (DS > 0.85). Pemerintah harus segera melakukan tindakan: pelebaran jalan (tambah lajur), penertiban parkir liar / pasar tumpah di bahu jalan, penyediaan transportasi umum, atau pemberlakuan sistem satu arah.")
        elif DS > 0.75:
            st.warning("⚠️ REKOMENDASI WASPADA: Jalan mulai mengalami kemacetan pada jam-jam sibuk. Perlunya sinkronisasi lampu lalu lintas di persimpangan terdekat dan larangan angkot ngetem sembarangan.")
        else:
            st.success("✅ REKOMENDASI AMAN: Kepadatan jalan masih sangat ideal. Perawatan jalan secara berkala sudah cukup untuk menjaga kenyamanan berkendara.")
 pip_flow = """
"""
