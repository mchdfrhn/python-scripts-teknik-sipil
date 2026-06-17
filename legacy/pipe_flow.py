import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

def page_pipe_flow():
    st.header("🚰 Hidrolika Pipa (Hazen-Williams)")
    st.write("Menghitung Kehilangan Tinggi Tekan (Head Loss) akibat gesekan dalam pipa bertekanan menggunakan persamaan Hazen-Williams.")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Parameter Jaringan Pipa")
        st.write("Asumsi: Debit $Q = 0.5$ L/s, Kekasaran Pipa PVC $C = 140$, Tekanan Awal $H_0 = 10$ m")
        
        length = st.slider("Panjang Pipa (m)", 10.0, 200.0, 50.0, step=10.0)
        diameter_mm = st.slider("Diameter Dalam Pipa (mm)", 12.0, 100.0, 25.0, step=1.0)
        
        # Hazen-Williams calculations
        C = 140.0
        Q = 0.0005 # m3/s
        D = diameter_mm / 1000.0 # m
        
        # hf = 10.67 * L * (Q/C)^1.852 / D^4.87
        head_loss = 10.67 * length * ((Q / C) ** 1.852) / (D ** 4.87)
        
        initial_head = 10.0
        final_head = initial_head - head_loss
        
        st.info(r"""
        **Persamaan Hazen-Williams:**
        $h_f = 10.67 \cdot L \cdot \frac{{(Q/C)^{{1.852}}}}{{D^{{4.87}}}}$
        $h_f$ = {head_loss:.2f} meter
        """.format(head_loss=head_loss))
        
    with col2:
        distances = np.linspace(0, length, 11)
        pressures = [max(0, initial_head - (head_loss * (x / length))) for x in distances]
        
        fig, ax = plt.subplots(figsize=(7, 4))
        ax.plot(distances, pressures, color='#0ea5e9', linewidth=3)
        ax.fill_between(distances, pressures, color='#0ea5e9', alpha=0.3)
        ax.set_ylim(0, 12)
        ax.set_xlim(0, length)
        ax.set_xlabel("Jarak Sepanjang Pipa (m)")
        ax.set_ylabel("Sisa Tinggi Tekan (m)")
        ax.set_title(f"Profil Kehilangan Tekanan (Tekanan Ujung: {max(0, final_head):.2f} m)")
        ax.grid(True, linestyle='--', alpha=0.6)
        
        st.pyplot(fig)
        
        st.metric("Sisa Tekanan Ujung (Final Head)", f"{max(0, final_head):.2f} meter")
        
        if final_head < 0:
            st.error("🚨 BAHAYA: Air tidak mengalir! Pipa terlalu kecil atau panjang sehingga gesekan (head loss) menghabiskan seluruh tekanan.")
        elif final_head < 3:
            st.warning("⚠️ WASPADA: Tekanan sisa sangat lemah (< 3m). Air di ujung keran hanya menetes atau mengalir sangat pelan.")
        else:
            st.success("✅ AMAN: Tekanan sisa mencukupi. Air mengalir deras di ujung pipa.")
