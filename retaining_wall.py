import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_retaining_wall():
    st.header("🧱 Dinding Penahan Tebing")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Tebing tanah yang curam di dekat rumah atau jalan berisiko longsor akibat dorongan berat tanah itu sendiri. Dinding penahan beton dibangun untuk menahan tekanan tanah tersebut. Dinding beton harus dirancang cukup berat dan lebar agar tidak **terguling** roboh atau **tergelincir** bergeser ke depan.
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Ukuran Dinding Beton")
        H = st.slider("Tinggi Dinding (Meter)", 2.0, 8.0, 4.0, step=0.5, help="Tinggi tebing tanah yang akan ditahan oleh dinding beton.")
        B = st.slider("Lebar Alas Dinding (Meter)", 1.0, 5.0, 2.5, step=0.1, help="Lebar tapak beton bagian bawah (alas). Makin lebar alas, dinding makin stabil.")
        a = st.slider("Lebar Atas Dinding (Meter)", 0.3, 1.5, 0.5, step=0.1, help="Lebar beton bagian puncak atas dinding.")
        
        # Validation: top width cannot exceed base width
        if a >= B:
            st.error("🚨 Lebar bagian atas tidak boleh melebihi atau sama dengan lebar alas bawah.")
            a = B - 0.2
            
        st.markdown("---")
        st.subheader("Sifat Tanah Tebing & Kelicinan")
        gamma_s = st.slider("Kepadatan Tanah Tebing (γ_s) (kN/m³)", 15.0, 21.0, 18.0, step=0.5, help="Berat jenis tanah di belakang dinding penahan.")
        phi = st.slider("Kemampuan Saling Mengunci Tanah (°)", 15, 45, 30, help="Makin besar sudutnya, tanah makin stabil dan gaya dorongnya ke dinding makin kecil.")
        
        # Base friction coefficient
        fric_coeff = st.slider("Kelicinan Dasar Dinding (μ)", 0.3, 0.7, 0.5, step=0.05, help="Koefisien gesek antara beton dinding dengan tanah di bawahnya (makin tinggi berarti dasar tanah makin kasar/tidak licin).")
        
        st.info("""
        💡 **Info Dinding untuk Awam:**
        * Dinding ini menahan tanah tebing menggunakan berat sendiri betonnya (Gravity Wall).
        * Gaya dorong tanah bekerja ke arah luar (mendorong dinding ke kiri).
        * Berat dinding menekan ke bawah, menciptakan gaya gesek di dasar untuk menahan dinding agar tidak bergeser.
        """)
        
    with col2:
        # 1. Rankine Earth Pressure Coefficient
        phi_rad = np.radians(phi)
        Ka = (1 - np.sin(phi_rad)) / (1 + np.sin(phi_rad))
        
        # 2. Active Horizontal Force
        Pa = 0.5 * gamma_s * H**2 * Ka
        
        # 3. Overturning Moment (around the toe, bottom-left)
        Mo = Pa * (H / 3)
        
        # 4. Resisting Force (Weight of Wall blocks)
        # Concrete unit weight
        gamma_c = 24.0 # kN/m³
        
        # Split wall into a rectangle (right side) and a triangle (left side)
        W_rect = a * H * gamma_c
        x_rect = (B - a) + (a / 2) # centroid from toe
        
        W_tri = 0.5 * (B - a) * H * gamma_c
        x_tri = 2/3 * (B - a) # centroid from toe
        
        total_weight = W_rect + W_tri
        Mr = (W_rect * x_rect) + (W_tri * x_tri)
        
        # 5. Sliding Resistance
        Fr = total_weight * fric_coeff
        
        # Safety Factors
        SF_overturning = Mr / Mo if Mo > 0 else 99.0
        SF_sliding = Fr / Pa if Pa > 0 else 99.0
        
        # Metrics Display
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Angka Aman Terhadap Guling", f"{SF_overturning:.2f}",
                      delta="Aman" if SF_overturning >= 1.5 else "Bahaya Guling",
                      delta_color="normal" if SF_overturning >= 1.5 else "inverse",
                      help="Rasio penahan guling dibanding gaya dorong guling (Desain aman jika nilai >= 1.5).")
        with m2:
            st.metric("Angka Aman Terhadap Geser", f"{SF_sliding:.2f}",
                      delta="Aman" if SF_sliding >= 1.5 else "Bahaya Geser",
                      delta_color="normal" if SF_sliding >= 1.5 else "inverse",
                      help="Rasio kekuatan gesek penahan dibanding gaya dorong geser (Desain aman jika nilai >= 1.5).")
                       
        # Plotting Retaining Wall diagram
        fig, ax = plt.subplots(figsize=(6, 5))
        
        # Draw base ground line
        ax.axhline(0, color='brown', lw=3)
        ax.fill_between([-1, B + 2], [0, 0], [-1.5, -1.5], color='#e2b48a', alpha=0.3)
        
        # Draw backfill soil (right side of wall)
        ax.fill_between([B, B + 2], [0, 0], [H, H], color='#c89d7c', alpha=0.5)
        ax.axhline(H, color='brown', lw=2)
        
        # Draw Wall coordinates: trapezoid
        wall_x = [0, B, B, B-a, 0]
        wall_y = [0, 0, H, H, 0]
        ax.plot(wall_x, wall_y, color='#444444', lw=3, label="Dinding Beton")
        ax.fill(wall_x, wall_y, color='#b0b0b0')
        
        # Draw active pressure triangle
        press_x = [B, B + Ka*gamma_s*H*0.1, B, B] # scale factor 0.1 for plotting
        press_y = [0, 0, H, 0]
        ax.plot(press_x, press_y, color='red', linestyle='--', label="Tekanan Tanah Mendorong")
        ax.fill(press_x, press_y, color='red', alpha=0.1)
        
        # Draw force arrows
        # Active soil force arrow
        ax.annotate('', xy=(B - 0.2, H/3), xytext=(B + 1.2, H/3),
                    arrowprops=dict(facecolor='red', shrink=0.05, width=2, headwidth=8))
        ax.text(B + 0.3, H/3 + 0.2, f'Dorongan Pa = {Pa:.1f} kN', color='red', fontweight='bold')
        
        # Gravity force arrow
        ax.annotate('', xy=((B-a/2), H/2 - 0.5), xytext=((B-a/2), H/2 + 0.5),
                    arrowprops=dict(facecolor='blue', shrink=0.05, width=2, headwidth=8))
        ax.text((B-a/2) + 0.1, H/2 + 0.2, f'Berat Beton W = {total_weight:.1f} kN', color='blue', fontweight='bold')
        
        # Visual setup
        ax.set_xlim(-1, B + 2.5)
        ax.set_ylim(-1, H + 1.5)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.legend(loc='upper left')
        st.pyplot(fig)
        plt.close()
        
        # Engineering assessment
        st.subheader("Hasil Evaluasi Kekuatan Dinding")
        guling_aman = SF_overturning >= 1.5
        geser_aman = SF_sliding >= 1.5
        
        if guling_aman and geser_aman:
            st.success("✅ DINDING AMAN KOKOH: Konstruksi dinding penahan stabil! Struktur aman dari risiko terguling roboh maupun tergelincir bergeser.")
        else:
            if not guling_aman:
                st.error("🚨 BAHAYA ROBOH TERGULING: Dinding beton kurang lebar di bagian alas bawah atau kurang berat, sehingga berisiko terguling jatuh ke depan! Solusi: Perlebar ukuran alas bawah (B) atau buat dinding lebih tebal.")
            if not geser_aman:
                st.error("🚨 BAHAYA TERGELINCIR: Dinding berisiko tergeser tergelincir ke depan karena dasar tanah di bawahnya terlalu licin atau dinding kurang berat! Solusi: Buat dinding lebih berat, perkasar semen dasar, atau pasang tiang penahan (shear key) menancap ke bawah.")
