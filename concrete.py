import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_concrete():
    st.header("🧪 Peracik Beton Ramah Lingkungan")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Semen adalah bahan perekat beton, namun pembuatan semen melepas gas $CO_2$ (karbon) yang sangat besar ke atmosfer bumi. Di sini Anda bisa meracik beton ramah lingkungan (*Eco-Concrete*) dengan menyubstitusi sebagian semen menggunakan **Abu Terbang (Fly Ash)**—limbah pembakaran batu bara—tanpa mengurangi kekuatan struktur beton!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Bahan Campuran Beton (per 1 m³)")
        semen = st.slider("Jumlah Semen Bersih (kg)", 200, 500, 350, help="Bahan perekat utama beton. Makin banyak semen, makin besar emisi karbonnya.")
        air = st.slider("Jumlah Air Campuran (Liter)", 140, 220, 180, help="Air bereaksi kimia dengan semen untuk mengeras.")
        fly_ash = st.slider("Abu Terbang / Fly Ash (kg)", 0, 150, 50, help="Limbah abu batubara pengganti semen. Ramah lingkungan dan murah.")
        agregat = st.slider("Kerikil & Pasir (kg)", 800, 1200, 1000, help="Bahan pengisi padat berupa batu pecah/kerikil dan pasir.")
        
        st.info("""
        💡 **Info Penting untuk Awam:**
        * **Abu Terbang (Fly Ash)** mengurangi jumlah semen yang dibutuhkan, sehingga jejak karbon semen berkurang.
        * Perbandingan berat antara Air dan Semen disebut **Faktor Air Semen (FAS)**. Angka ini menentukan kekentalan adukan beton.
        """)
        
    with col2:
        # Rumus empiris sederhana untuk memprediksi kuat tekan beton (K / MPa)
        # Faktor Air Semen (water-cement ratio)
        # Fly ash memiliki kontribusi kekuatan yang lebih rendah secara instan dibandingkan semen,
        # diwakili oleh koefisien efisiensi (misal 0.4)
        water_cement_ratio = air / (semen + (fly_ash * 0.4))
        
        # Kuat tekan berbanding terbalik dengan w/c ratio
        predicted_strength = max(10, min(60, 100 * (0.8 - water_cement_ratio) + (agregat / 200)))
        
        # Hitung Jejak Emisi Karbon
        # Semen menghasilkan sekitar 0.9 kg CO2 per kg semen
        # Fly ash (limbah) menghasilkan sekitar 0.05 kg CO2 per kg
        # Agregat menghasilkan sekitar 0.01 kg CO2 per kg
        total_co2 = (semen * 0.9) + (fly_ash * 0.05) + (agregat * 0.01)
        
        # Bandingkan dengan beton konvensional standar (tanpa fly ash, semen = semen + fly_ash)
        total_co2_ref = ((semen + fly_ash) * 0.9) + (agregat * 0.01)
        savings_percent = ((total_co2_ref - total_co2) / total_co2_ref) * 100 if total_co2_ref > 0 else 0
        
        # Metric display
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Kekuatan Beton (Kuat Tekan)", f"{predicted_strength:.1f} MPa", help="Kekuatan beton menahan tekanan (makin besar makin kuat).")
        with m2:
            st.metric(
                "Emisi Karbon (Gas Buang CO₂)", 
                f"{total_co2:.1f} kg/m³", 
                delta=f"-{savings_percent:.1f}% Ramah Lingkungan" if savings_percent > 0 else None,
                delta_color="inverse"
            )
            
        # Plotting comparison
        fig, ax = plt.subplots(figsize=(6, 3.5))
        categories = ['Beton Biasa (Tanpa Abu)', 'Beton Ramah Lingkungan']
        emissions = [total_co2_ref, total_co2]
        colors = ['#FF4B4B', '#2CA02C']
        
        bars = ax.bar(categories, emissions, color=colors, width=0.4)
        ax.set_ylabel('Jejak Emisi Karbon CO₂ (kg/m³)')
        ax.set_title('Perbandingan Emisi Karbon per 1 m³ Beton')
        
        # Add values on top of bars
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.1f} kg',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),  # 3 points vertical offset
                        textcoords="offset points",
                        ha='center', va='bottom', fontweight='bold')
                        
        ax.set_ylim(0, max(emissions) * 1.2)
        ax.grid(True, axis='y', linestyle=':', alpha=0.6)
        st.pyplot(fig)
        plt.close()
        
        # Analisis dan Rekomendasi
        st.subheader("Analisis Hasil Campuran Beton")
        
        # 1. FAS Analysis
        if water_cement_ratio < 0.4:
            st.warning("⚠️ Campuran Terlalu Kering (Kekurangan Air): Beton akan sangat sulit diaduk, dituang, dan diratakan tanpa tambahan cairan superplasticizer.")
        elif water_cement_ratio > 0.6:
            st.error("🚨 Campuran Terlalu Encer (Kelebihan Air): Air akan memisahkan kerikil dan semen (segregasi), membuat beton sangat keropos dan rapuh setelah kering.")
        else:
            st.success("✅ Kekentalan Ideal: Faktor air semen seimbang. Campuran beton mudah dikerjakan dengan kekuatan optimal.")
            
        # 2. Strength & Emisi Analysis
        if predicted_strength >= 40:
            st.info("💪 Mutu Tinggi (Beton Khusus): Sangat kuat! Cocok untuk tiang utama gedung bertingkat tinggi (pencakar langit) dan jembatan bentang panjang.")
        elif predicted_strength >= 25:
            st.info("🏢 Mutu Sedang (Beton Struktural): Cocok untuk komponen struktur utama rumah tinggal bertingkat, balok kolom, dan lantai beton.")
        else:
            st.warning("🏡 Mutu Rendah (Beton Non-Struktural): Kekuatannya rendah. Hanya direkomendasikan untuk jalan carport rumah, lantai dasar sebelum keramik, atau pagar taman.")
