import streamlit as st
import matplotlib.pyplot as plt

def page_traffic():
    st.header("🚗 Analisis Kapasitas Jalan (MKJI 1997)")
    st.write("Menentukan Tingkat Pelayanan (Level of Service / LOS) Jalan Perkotaan berdasarkan Volume Lalu Lintas dan Kapasitas menurut Manual Kapasitas Jalan Indonesia (1997).")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Data Arus Lalu Lintas")
        volume = st.slider("Volume Lalu Lintas (smp/jam)", 500, 8000, 2500, step=100, help="Satuan Mobil Penumpang (smp) per jam.")
        lanes = st.slider("Jumlah Lajur", 1, 4, 2)
        
        # MKJI 1997 Calculations
        C0 = 1650 # Kapasitas Dasar per lajur (smp/jam)
        FCw = 1.0 # Lebar Lajur standar 3.5m
        FCsp = 1.0 # Pemisah Arah terbagi
        FCsf = 0.90 # Hambatan samping sedang
        FCcs = 1.0 # Ukuran kota
        
        capacity = C0 * lanes * FCw * FCsp * FCsf * FCcs
        ds = volume / capacity # Degree of Saturation (Derajat Kejenuhan)
        
        if ds <= 0.45:
            los = 'A'
            color = '#10b981'
        elif ds <= 0.60:
            los = 'B'
            color = '#34d399'
        elif ds <= 0.75:
            los = 'C'
            color = '#fbbf24'
        elif ds <= 0.85:
            los = 'D'
            color = '#f59e0b'
        elif ds <= 1.00:
            los = 'E'
            color = '#ef4444'
        else:
            los = 'F'
            color = '#7f1d1d'
            
        st.info(f"""
        📊 **Hasil Hitungan:**
        - **Kapasitas (C):** {capacity:.0f} smp/jam
        - **Derajat Kejenuhan (DS):** {ds:.2f}
        - **Tingkat Pelayanan (LOS):** {los}
        """)
        
    with col2:
        st.subheader(f"Tingkat Pelayanan Jalan: Level {los}")
        
        # Simple gauge chart for DS
        fig, ax = plt.subplots(figsize=(6, 1))
        ax.barh([0], [capacity], color='lightgray', height=0.5, label='Kapasitas')
        ax.barh([0], [volume], color=color, height=0.5, label='Volume Aktual')
        ax.set_xlim(0, max(capacity, volume) + 500)
        ax.set_yticks([])
        ax.set_xlabel("Kendaraan (smp/jam)")
        ax.legend()
        ax.set_title(f"Visualisasi Volume / Kapasitas (DS = {ds:.2f})")
        
        st.pyplot(fig)
        
        if los == 'F':
            st.error("🚨 MACET TOTAL (Level F): Arus tertahan, antrean panjang, kecepatan sangat rendah. Dibutuhkan pelebaran jalan atau manajemen rekayasa lalin (misal: satu arah).")
        elif los == 'E':
            st.error("⚠️ MENDEKATI MACET (Level E): Volume mendekati kapasitas, sering berhenti. Arus tidak stabil.")
        elif los == 'D':
            st.warning("⚠️ ARUS PADAT (Level D): Kecepatan menurun signifikan, jarak antar kendaraan sangat rapat.")
        elif los == 'C':
            st.success("✅ ARUS STABIL (Level C): Kepadatan mulai terasa, gerak kendaraan cukup dibatasi, tapi tidak macet.")
        elif los == 'B':
            st.success("✅ LANCAR (Level B): Arus stabil, masih ada ruang bermanuver.")
        else:
            st.success("✅ SANGAT LANCAR (Level A): Arus bebas, pengemudi dapat memilih kecepatan dengan bebas.")
