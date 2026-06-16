import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_pipe_flow():
    st.header("🚰 Tekanan Air Pipa Rumah")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Pernahkah Anda heran mengapa air keran di kamar mandi lantai atas mengalir sangat kecil, padahal pompa menyala kuat? Air kehilangan tekanannya akibat gesekan dengan dinding dalam pipa (kehilangan utama) dan hambatan di setiap belokan pipa atau kran air (kehilangan sekunder). Mari simulasikan pipa rumah Anda!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Ukuran & Bahan Pipa")
        material = st.selectbox("Bahan Utama Pipa", [
            "Plastik PVC (Paling Licin & Murah)", 
            "Baja / Besi Cor (Cukup Licin & Sangat Kuat)", 
            "Beton / Concrete (Agak Kasar & Ukuran Besar)"
        ])
        diameter_mm = st.slider("Ukuran Lebar Pipa (Diameter Dalam) (mm)", 15, 600, 50, step=5, help="Makin kecil pipa, makin besar gesekan yang menahan air.")
        length_m = st.slider("Panjang Total Saluran Pipa (Meter)", 5, 500, 50, step=5, help="Makin panjang pipa, tekanan air akan makin drop di ujung keran.")
        
        st.markdown("---")
        st.subheader("Hambatan / Belokan (Minor Loss)")
        n_bends = st.slider("Jumlah Belokan Pipa L (Siku 90°)", 0, 15, 4, help="Setiap belokan membelokkan arah air dan mengurangi kecepatannya.")
        n_valves = st.slider("Jumlah Stop Kran Bulat (Terbuka Penuh)", 0, 10, 2, help="Kran pembatas aliran air.")
        n_check = st.slider("Jumlah Katup Satu Arah (Check Valve)", 0, 5, 1, help="Katup pencegah air mengalir balik ke pompa.")
        
        st.markdown("---")
        st.subheader("Aliran Air")
        Q_lps = st.slider("Debit Aliran Air yang Diinginkan (Liter/Detik)", 0.2, 50.0, 2.0, step=0.1, help="Berapa banyak air yang ingin Anda alirkan per detiknya (2 Liter/detik cukup untuk menyalakan kran wastafel & shower sekaligus).")
        
    with col2:
        # Hazen-Williams C roughness coefficients
        c_dict = {
            "Plastik PVC (Paling Licin & Murah)": 150.0,
            "Baja / Besi Cor (Cukup Licin & Sangat Kuat)": 120.0,
            "Beton / Concrete (Agak Kasar & Ukuran Besar)": 100.0
        }
        C = c_dict[material]
        
        # Unit conversions
        Q_m3s = Q_lps / 1000.0
        D_m = diameter_mm / 1000.0
        
        # Calculate Flow Velocity v = Q / A
        A = (np.pi * D_m**2) / 4.0
        velocity = Q_m3s / A
        
        # Major friction loss (Hazen-Williams)
        hf = 10.67 * length_m * (Q_m3s**1.852) * (C**-1.852) * (D_m**-4.87)
        
        # Minor loss calculation: hm = sum(K_L) * v^2 / 2g
        g = 9.81
        sum_Kl = (n_bends * 0.9) + (n_valves * 0.2) + (n_check * 2.0)
        hm = sum_Kl * (velocity**2) / (2 * g)
        
        # Total head loss
        total_loss = hf + hm
        
        # Metrics Display
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Kehilangan Tekanan Air Total", f"{total_loss:.2f} Meter Air", 
                      help=f"Kehilangan akibat gesekan pipa: {hf:.2f}m | Kehilangan akibat belokan/aksesoris: {hm:.2f}m. Kehilangan sebesar 10 Meter Air setara dengan berkurangnya tekanan sebesar 1 bar.")
        with m2:
            st.metric("Kecepatan Aliran Air dalam Pipa", f"{velocity:.2f} m/detik", help="Kecepatan bergeraknya air di dalam pipa.")
            
        # Plotting Q vs ht curve
        Q_range_lps = np.linspace(0.1, Q_lps * 2.0, 50)
        Q_range_m3s = Q_range_lps / 1000.0
        
        # major range
        hf_range = 10.67 * length_m * (Q_range_m3s**1.852) * (C**-1.852) * (D_m**-4.87)
        # minor range
        v_range = Q_range_m3s / A
        hm_range = sum_Kl * (v_range**2) / (2 * g)
        
        total_loss_range = hf_range + hm_range
        
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.plot(Q_range_lps, total_loss_range, color='#0068C9', lw=2.5, label="Total Kehilangan Tekanan Air")
        ax.plot(Q_range_lps, hf_range, color='#98DF8A', linestyle='--', label="Gesekan dalam Pipa Saja")
        ax.plot(Q_lps, total_loss, 'ro', label="Kondisi Rumah Anda")
        ax.set_xlabel("Kecepatan Debit Air Q (Liter/Detik)")
        ax.set_ylabel("Kehilangan Tekanan Air (Meter)")
        ax.set_title("Grafik Hubungan Debit Air vs Kehilangan Tekanan")
        ax.legend()
        ax.grid(True, alpha=0.3)
        st.pyplot(fig)
        plt.close()
        
        # Hydrological recommendations
        st.subheader("Hasil Analisis Perpipaan")
        
        # Velocity analysis
        if velocity < 0.6:
            st.warning("⚠️ ALIRAN AIR TERLALU LAMBAT: Kecepatan air di dalam pipa di bawah 0.6 m/detik. Air yang lambat berisiko menyebabkan lumut, lumpur, dan pasir mengendap di dalam pipa, sehingga pipa lambat laun akan mampet. Solusi: Gunakan ukuran diameter pipa yang sedikit lebih kecil.")
        elif velocity > 2.0:
            st.error("🚨 ALIRAN AIR TERLALU KENCANG: Kecepatan air di atas 2.0 m/detik! Sangat berbahaya karena bisa menimbulkan getaran hebat pada pipa dan berpotensi 'Water Hammer' (efek palu air) yang bisa memecahkan sambungan pipa seketika saat kran ditutup tiba-tiba. Solusi: Gunakan diameter pipa yang lebih besar.")
        else:
            st.success("✅ KECEPATAN AIR IDEAL: Kecepatan air seimbang (0.6 - 2.0 m/detik). Pipa akan tetap bersih dari endapan kotoran tanpa risiko pipa pecah akibat benturan air.")
            
        # Pressure / Head loss advice
        if total_loss > (length_m * 0.05):
            st.warning("⚠️ DROP TEKANAN SANGAT TINGGI: Kehilangan tekanan melebihi 5% dari panjang pipa. Air yang keluar di keran Anda kemungkinan besar akan mengalir loyo/kecil. Solusi: Perbesar diameter pipa untuk memperlancar aliran air, kurangi belokan siku, atau pasang pompa pendorong (booster pump) di dekat kamar mandi.")
