import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

def page_project_scheduling():
    st.header("📅 Simulasi Penjadwalan Proyek")
    st.write("""
    **Mengapa simulasi ini penting bagi Anda?**  
    Saat merencanakan pembangunan rumah, ada pekerjaan yang jika terlambat akan menunda seluruh tanggal serah terima kunci rumah (Jalur Kritis). Ada juga pekerjaan yang boleh terlambat tanpa menunda penyelesaian proyek keseluruhan (Kelonggaran Waktu). Mari susun jadwal pengerjaannya!
    """)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Durasi Pengerjaan (Hari)")
        dur_A = st.slider("Pekerjaan A: Persiapan & Mobilisasi", 1, 10, 3, help="Mempersiapkan lokasi, meratakan tanah, dan mengirim alat kerja.")
        dur_B = st.slider("Pekerjaan B: Galian Tanah Pondasi", 2, 14, 5, help="Menggali parit untuk pondasi dasar.")
        dur_C = st.slider("Pekerjaan C: Pengecoran Beton Pondasi", 3, 20, 7, help="Memasang besi dan mengecor beton pondasi cakar ayam.")
        dur_D = st.slider("Pekerjaan D: Dinding & Tiang Rumah", 3, 20, 6, help="Memasang dinding bata merah/hebel dan tiang beton kolom.")
        dur_E = st.slider("Pekerjaan E: Pemasangan Rangka Atap", 2, 14, 4, help="Memasang rangka baja ringan dan genteng penutup.")
        dur_F = st.slider("Pekerjaan F: Finishing & Cat Jendela", 1, 10, 3, help="Melakukan pengecatan dinding dan pemasangan pintu/jendela.")
        
        st.info("""
        💡 **Info Manajemen Proyek:**
        * Jalur pengerjaan diatur berdasarkan urutan ketergantungan:
          - A dilakukan pertama kali.
          - B menunggu A selesai.
          - C dan D bisa dikerjakan berbarengan setelah B selesai.
          - E menunggu C dan D selesai.
          - F dikerjakan paling akhir setelah E selesai.
        """)
        
    with col2:
        # Forward Pass
        es_A = 0
        ef_A = dur_A
        
        es_B = ef_A
        ef_B = es_B + dur_B
        
        es_C = ef_B
        ef_C = es_C + dur_C
        
        es_D = ef_B
        ef_D = es_D + dur_D
        
        es_E = max(ef_C, ef_D)
        ef_E = es_E + dur_E
        
        es_F = ef_E
        ef_F = es_F + dur_F
        
        proj_duration = ef_F
        
        # Backward Pass
        lf_F = proj_duration
        ls_F = lf_F - dur_F
        
        lf_E = ls_F
        ls_E = lf_E - dur_E
        
        lf_C = ls_E
        ls_C = lf_C - dur_C
        
        lf_D = ls_E
        ls_D = lf_D - dur_D
        
        lf_B = min(ls_C, ls_D)
        ls_B = lf_B - dur_B
        
        lf_A = ls_B
        ls_A = lf_A - dur_A
        
        # Slack Calculation
        slack_A = ls_A - es_A
        slack_B = ls_B - es_B
        slack_C = ls_C - es_C
        slack_D = ls_D - es_D
        slack_E = ls_E - es_E
        slack_F = ls_F - es_F
        
        # Assemble task data
        tasks = [
            "A: Persiapan Lahan", 
            "B: Galian Pondasi", 
            "C: Cor Pondasi", 
            "D: Pasang Dinding", 
            "E: Rangka Atap", 
            "F: Finishing & Cat"
        ]
        es_list = [es_A, es_B, es_C, es_D, es_E, es_F]
        dur_list = [dur_A, dur_B, dur_C, dur_D, dur_E, dur_F]
        slack_list = [slack_A, slack_B, slack_C, slack_D, slack_E, slack_F]
        
        critical_path = []
        for t, s in zip(tasks, slack_list):
            if s == 0:
                critical_path.append(t.split(":")[0]) # Get letter
                
        # Metrics Display
        m1, m2 = st.columns(2)
        with m1:
            st.metric("Total Waktu Pengerjaan Rumah", f"{proj_duration} Hari", help="Waktu tersingkat untuk menyelesaikan seluruh proyek rumah.")
        with m2:
            st.metric("Jalur Kritis (Wajib Tepat Waktu)", " → ".join(critical_path), help="Rantai urutan pekerjaan yang tidak boleh terlambat sama sekali.")
            
        # Plotting Gantt Chart
        fig, ax = plt.subplots(figsize=(6, 4))
        
        y_pos = np.arange(len(tasks))
        
        # Color: red for critical path, grey for non-critical
        colors = ['#FF4B4B' if s == 0 else '#b0b0b0' for s in slack_list]
        
        ax.barh(y_pos, dur_list, left=es_list, color=colors, edgecolor='black', alpha=0.8, height=0.5)
        
        # Draw slack lines if slack > 0
        for i, (es, dur, slack) in enumerate(zip(es_list, dur_list, slack_list)):
            if slack > 0:
                ax.plot([es + dur, es + dur + slack], [i, i], color='#0068C9', linestyle='--', marker='|', lw=2)
                ax.text(es + dur + (slack/2), i + 0.15, f'Boleh Lambat {slack} hari', color='#0068C9', fontsize=8, ha='center')
                
        ax.set_yticks(y_pos)
        ax.set_yticklabels(tasks)
        ax.invert_yaxis()  # top-down
        ax.set_xlabel("Waktu Kerja (Hari)")
        ax.set_title("Gantt Chart Jadwal Kerja (Merah = Jalur Kritis / Wajib Tepat Waktu)")
        ax.grid(True, axis='x', linestyle=':', alpha=0.5)
        st.pyplot(fig)
        plt.close()
        
        # Scheduling suggestions
        st.subheader("Hasil Analisis Jadwal Proyek")
        st.write(f"Rantai pekerjaan utama yang harus diawasi ketat: **{', '.join(critical_path)}**")
        st.markdown("""
        * **Pekerjaan Jalur Kritis (Merah)** memiliki kelonggaran waktu = 0. Jika pekerjaan ini mundur 1 hari saja (misalnya galian tanah atau cor pondasi), maka penyelesaian seluruh rumah Anda akan langsung terlambat 1 hari.
        * **Pekerjaan Non-Kritis (Abu-Abu)** memiliki toleransi keterlambatan (*Slack*). Sebagai contoh, pekerjaan **D: Pasang Dinding** memiliki kelonggaran waktu sebesar **{} hari**. Artinya, tukang boleh menunda atau memperlambat pekerjaan ini hingga batas tersebut tanpa menunda jadwal serah terima kunci rumah secara keseluruhan.
        """.format(int(slack_D)))
