import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_soil_bearing():
    st.header("🪨 Kekuatan Tanah Pondasi")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Sebelum membangun rumah, kita harus memastikan bahwa tanah di bawahnya cukup kuat menahan berat beton dan dinding rumah. Jika tanah terlalu lembek atau becek karena air tanah, pondasi rumah bisa amblas dan membuat dinding retak-retak. Mari uji kekuatan tanah Anda!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Bentuk & Ukuran Pondasi")
        footing_type = st.selectbox("Bentuk Pondasi Beton", [
            "Persegi (Pondasi Tapak Cakar Ayam)", 
            "Memanjang (Pondasi Lajur Batu Kali)", 
            "Lingkaran (Pondasi Sumuran)"
        ])
        B = st.slider("Lebar Pondasi (Meter)", 0.5, 5.0, 1.5, step=0.1, help="Lebar tapak beton pondasi yang bersentuhan dengan tanah.")
        Df = st.slider("Kedalaman Galian Pondasi (Meter)", 0.5, 4.0, 1.2, step=0.1, help="Kedalaman galian tanah tempat diletakkannya pondasi.")
        
        st.markdown("---")
        st.subheader("Sifat Fisik Tanah Dasar")
        cohesion = st.slider("Daya Lekat Tanah / Kohesi (kPa)", 0, 100, 20, help="Kekuatan tanah menempel satu sama lain (tanah lempung/tanah liat memiliki kohesi tinggi; pasir kering memiliki kohesi nol).")
        phi = st.slider("Kemampuan Saling Mengunci / Sudut Geser (°)", 0, 45, 25, help="Kemampuan butiran tanah saling mengunci saat ditekan (pasir padat atau kerikil memiliki nilai sudut geser tinggi).")
        gamma = st.slider("Kepadatan Berat Isi Tanah (γ) (kN/m³)", 14.0, 22.0, 18.0, step=0.5, help="Berat jenis rata-rata tanah per meter kubik.")
        
        st.markdown("---")
        st.subheader("Kondisi Air & Faktor Keamanan")
        dw = st.slider("Kedalaman Air Tanah / Sumur (Meter)", 0.0, 8.0, 4.0, step=0.5, help="Kedalaman ditemukannya air tanah diukur dari permukaan tanah.")
        SF = st.slider("Faktor Keamanan Rumah (Safety Factor)", 2.0, 4.0, 3.0, step=0.5, help="Faktor pengaman kekuatan desain agar pondasi jauh dari risiko kegagalan (standar nasional = 3.0).")
        
    with col2:
        # Terzaghi factors calculation
        phi_rad = np.radians(phi)
        
        if phi == 0:
            Nq = 1.0
            Nc = 5.7
            Ngamma = 0.0
        else:
            # Terzaghi approximation
            Nq = np.exp(np.pi * np.tan(phi_rad)) * (np.tan(np.pi/4 + phi_rad/2))**2
            Nc = (Nq - 1.0) / np.tan(phi_rad)
            Ngamma = 2 * (Nq + 1) * np.tan(phi_rad)
            
        # Shape factors
        if "Persegi" in footing_type:
            sc, sg = 1.3, 0.8
        elif "Lingkaran" in footing_type:
            sc, sg = 1.3, 0.6
        else:
            sc, sg = 1.0, 1.0
            
        # Water table correction for unit weight and overburden pressure
        gamma_w = 9.81 # water unit weight kN/m3
        gamma_sub = gamma - gamma_w
        
        # 1. Overburden pressure (q) at foundation level
        if dw <= Df:
            q = (dw * gamma) + ((Df - dw) * gamma_sub)
        else:
            q = Df * gamma
            
        # 2. Unit weight for the wedge term (gamma_3) below footing
        if dw <= Df:
            gamma_3 = gamma_sub
        elif dw < Df + B:
            gamma_3 = gamma_sub + ((dw - Df) / B) * (gamma - gamma_sub)
        else:
            gamma_3 = gamma
            
        # Ultimate bearing capacity (q_ult)
        q_ult = (cohesion * Nc * sc) + (q * Nq) + (0.5 * gamma_3 * B * Ngamma * sg)
        # Allowable bearing capacity (q_all)
        q_all = q_ult / SF
        
        # Display Metrics
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Batas Kekuatan Maksimal Tanah (q_ult)", f"{q_ult:.1f} kPa", help="Tegangan maksimal sebelum tanah runtuh amblas.")
        with m2:
            st.metric("Batas Aman Beban Rumah (q_all)", f"{q_all:.1f} kPa", help="Tegangan aman yang boleh disalurkan ke tanah (Kekuatan Maksimal dibagi Faktor Keamanan).")
            
        # Plotting cross-section diagram
        fig, ax = plt.subplots(figsize=(6, 4))
        
        # Draw ground line
        ax.axhline(0, color='brown', lw=3, label="Permukaan Tanah")
        ax.fill_between([-B*2, B*2], [0, 0], [-Df-B*1.5, -Df-B*1.5], color='#e2b48a', alpha=0.3)
        
        # Draw footing (rect)
        footing_x = [-B/2, B/2, B/2, -B/2, -B/2]
        footing_y = [-Df, -Df, -Df+0.4, -Df+0.4, -Df]
        ax.plot(footing_x, footing_y, color='#555555', lw=3, label="Beton Pondasi")
        ax.fill(footing_x, footing_y, color='#b0b0b0')
        
        # Draw column
        col_w = B * 0.25
        column_x = [-col_w/2, col_w/2, col_w/2, -col_w/2, -col_w/2]
        column_y = [-Df+0.4, -Df+0.4, 0.5, 0.5, -Df+0.4]
        ax.plot(column_x, column_y, color='#555555', lw=3)
        ax.fill(column_x, column_y, color='#cccccc')
        
        # Draw water table (MAT) line
        view_depth = Df + B * 1.5
        if dw < view_depth:
            ax.axhline(-dw, color='#00a8ff', linestyle='-.', lw=2.5, label="Muka Air Tanah (MAT)")
            ax.text(B * 1.1, -dw + 0.15, "MAT 💧", color='#00a8ff', fontweight='bold')
            
        # Draw load arrow
        ax.annotate('', xy=(0, -Df+0.4), xytext=(0, 0.8),
                    arrowprops=dict(facecolor='red', shrink=0.05, width=3, headwidth=10))
        ax.text(0.1, 0.6, 'Beban Rumah (P)', color='red', fontweight='bold')
        
        # Annotate dimensions
        ax.annotate('', xy=(-B/2, -Df-0.2), xytext=(B/2, -Df-0.2),
                    arrowprops=dict(arrowstyle='<->', color='blue'))
        ax.text(0, -Df-0.5, f'Lebar B = {B}m', color='blue', ha='center', fontweight='bold')
        
        ax.annotate('', xy=(-B - 0.2, -Df), xytext=(-B - 0.2, 0),
                    arrowprops=dict(arrowstyle='<->', color='green'))
        ax.text(-B - 0.6, -Df/2, f'Dalam Df = {Df}m', color='green', va='center', fontweight='bold')
        
        # Visual limits
        ax.set_xlim(-B*1.8, B*1.8)
        ax.set_ylim(-view_depth, 1.2)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.legend(loc='lower left')
        st.pyplot(fig)
        plt.close()
        
        # Civil recommendations
        st.subheader("Hasil Analisis Kekuatan Pondasi")
        
        # Warning if water table is above footing level
        if dw <= Df:
            st.warning("⚠️ PERINGATAN KONDISI BASAH: Air tanah terdeteksi di atas dasar galian pondasi. Air tanah mengurangi kekuatan dukung tanah hingga setengahnya karena tanah becek, serta menyulitkan proses penggalian dan pengecoran pondasi.")
            
        if q_all < 100:
            st.error("🚨 TANAH SANGAT LUNAK: Batas beban aman sangat rendah (< 100 kPa). Tanah terlalu lembek untuk memikul rumah langsung. Solusi: Lakukan pemadatan tanah / campur semen (stabilisasi), perlebar tapak beton (B), atau gunakan tiang pancang/bore pile (cakar ayam dalam).")
        elif q_all < 250:
            st.warning("⚠️ TANAH SEDANG: Batas beban aman sedang (100 - 250 kPa). Sangat cocok untuk bangunan rumah sederhana 1 - 2 lantai dengan ukuran pondasi tapak standar.")
        else:
            st.success("✅ TANAH PADAT/KERAS: Batas beban aman sangat tinggi (> 250 kPa). Tanah sangat kokoh dan aman untuk menyangga pondasi rumah atau gedung ruko tanpa khawatir amblas.")
