import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st

# Import all page functions from separated modules
from earthquake import page_earthquake
from hydrology import page_hydrology
from concrete import page_concrete
from soil_bearing import page_soil_bearing
from steel_beam import page_steel_beam
from traffic_flow import page_traffic_flow
from retaining_wall import page_retaining_wall
from pipe_flow import page_pipe_flow
from project_scheduling import page_project_scheduling
from wind_load import page_wind_load

# Configure main app page
st.set_page_config(
    page_title="Civil Intelligence Hub - Edukasi Sipil",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling via markdown CSS for glassmorphism and grid
st.markdown("""
    <style>
    .main-header {
        font-family: 'Outfit', 'Inter', sans-serif;
        background: linear-gradient(135deg, #FF4B4B, #FF8F00, #1E88E5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
        font-size: 2.8rem;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-family: 'Inter', sans-serif;
        color: #64748b;
        font-size: 1.1rem;
        margin-bottom: 1.8rem;
    }
    .category-title {
        font-family: 'Outfit', sans-serif;
        color: #1E88E5;
        font-weight: 700;
        font-size: 1.4rem;
        margin-top: 1.5rem;
        margin-bottom: 0.8rem;
        border-left: 5px solid #1E88E5;
        padding-left: 10px;
    }
    </style>
""", unsafe_allow_html=True)

def draw_card(title, desc, btn_label, target_page, key):
    with st.container(border=True):
        st.markdown(f"#### {title}")
        st.write(f"<p style='color: #64748b; font-size: 0.9rem; min-height: 60px;'>{desc}</p>", unsafe_allow_html=True)
        if st.button(btn_label, key=key, use_container_width=True, type="secondary"):
            st.session_state.active_page = target_page
            st.rerun()

def page_home():
    st.markdown('<h1 class="main-header">🏛️ Civil Scripts Hub</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Pusat Edukasi & Simulasi Interaktif Rekayasa Sipil untuk Masyarakat Awam.</p>', unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Group 1: Struktur & Kekuatan Gedung
    st.markdown('<div class="category-title">🏢 Rekayasa Struktur & Kekuatan Bangunan</div>', unsafe_allow_html=True)
    col1, col2, col3 = st.columns(3)
    with col1:
        draw_card(
            "Simulasi Gedung Tahan Gempa", 
            "Lihat bagaimana gedung bertingkat bergoyang saat gempa bumi dan cara merancang gedung agar aman dari risiko runtuh.", 
            "🏗️ Buka Simulator Gempa", 
            "🏗️ Simulasi Gedung Tahan Gempa", 
            "btn_eq"
        )
    with col2:
        draw_card(
            "Kelenturan Jembatan & Balok Baja", 
            "Simulasikan seberapa melengkung jembatan atau balok baja ketika dilewati kendaraan atau beban berat agar tidak patah.", 
            "🌉 Buka Analisis Balok", 
            "🌉 Kelenturan Jembatan & Balok", 
            "btn_beam"
        )
    with col3:
        draw_card(
            "Kekuatan Gedung Menahan Angin", 
            "Hitung seberapa kuat dinding dan kaca gedung bertingkat dalam menahan tiupan angin kencang atau badai badai besar.", 
            "💨 Buka Kalkulator Angin", 
            "💨 Kekuatan Gedung Menahan Angin", 
            "btn_wind"
        )
        
    # Group 2: Material & Manajemen Konstruksi
    st.markdown('<div class="category-title">🧪 Ramah Lingkungan & Manajemen Proyek</div>', unsafe_allow_html=True)
    col4, col5 = st.columns(2)
    with col4:
        draw_card(
            "Peracik Beton Ramah Lingkungan", 
            "Racik beton yang kokoh namun rendah emisi gas buang karbon dengan memanfaatkan abu limbah pembakaran batu bara.", 
            "🧪 Buka Peracik Beton", 
            "🧪 Peracik Beton Ramah Lingkungan", 
            "btn_concrete"
        )
    with col5:
        draw_card(
            "Simulasi Penjadwalan Proyek", 
            "Belajar menyusun jadwal kerja pembangunan rumah atau fasilitas umum agar selesai tepat waktu tanpa terlambat.", 
            "📅 Buka Penjadwalan Proyek", 
            "📅 Penjadwalan Proyek Konstruksi", 
            "btn_sched"
        )
        
    # Group 3: Tanah & Pondasi
    st.markdown('<div class="category-title">🪨 Rekayasa Tanah & Pondasi</div>', unsafe_allow_html=True)
    col6, col7 = st.columns(2)
    with col6:
        draw_card(
            "Kekuatan Tanah Pondasi Rumah", 
            "Uji apakah tanah di bawah rumah Anda cukup kuat menahan berat bangunan agar rumah tidak amblas ke dalam tanah.", 
            "🪨 Buka Kekuatan Tanah", 
            "🪨 Kekuatan Tanah Pondasi", 
            "btn_soil"
        )
    with col7:
        draw_card(
            "Dinding Penahan Tebing Longsor", 
            "Simulasikan kekuatan dinding beton dalam menahan tekanan tanah tebing agar tebing di dekat pemukiman aman dari longsor.", 
            "🧱 Buka Analisis Tebing", 
            "🧱 Dinding Penahan Tebing", 
            "btn_wall"
        )
        
    # Group 4: Air & Lalu Lintas
    st.markdown('<div class="category-title">🌊 Simulasi Air & Kepadatan Jalan</div>', unsafe_allow_html=True)
    col8, col9, col10 = st.columns(3)
    with col8:
        draw_card(
            "Bendungan Penangkal Banjir", 
            "Lihat bagaimana bendungan bekerja menampung air hujan deras dan mengatur aliran sungai agar kota di hilir bebas banjir.", 
            "🌊 Buka Simulator Bendungan", 
            "🌊 Bendungan Penangkal Banjir", 
            "btn_hydro"
        )
    with col9:
        draw_card(
            "Tekanan Air Pipa Rumah", 
            "Temukan alasan mengapa air keran di rumah Anda bisa mengecil akibat panjang pipa dan banyaknya belokan keran pipa.", 
            "🚰 Buka Simulasi Pipa Air", 
            "🚰 Tekanan Air Pipa Rumah", 
            "btn_pipe"
        )
    with col10:
        draw_card(
            "Kalkulator Kemacetan Jalan", 
            "Uji kapasitas jalan raya dan tentukan tingkat kenyamanan berkendara berdasarkan jumlah mobil yang lewat.", 
            "🚦 Buka Kalkulator Macet", 
            "🚦 Kalkulator Kemacetan Jalan", 
            "btn_traffic"
        )

    st.markdown("---")
    st.info("ℹ️ Pilih menu navigasi sidebar sebelah kiri untuk langsung beralih modul simulator.")

# List of pages in the application in Indonesian
page_options = [
    "📊 Dashboard Utama",
    "🏗️ Simulasi Gedung Tahan Gempa",
    "🌉 Kelenturan Jembatan & Balok",
    "💨 Kekuatan Gedung Menahan Angin",
    "🧪 Peracik Beton Ramah Lingkungan",
    "📅 Penjadwalan Proyek Konstruksi",
    "🪨 Kekuatan Tanah Pondasi",
    "🧱 Dinding Penahan Tebing",
    "🌊 Bendungan Penangkal Banjir",
    "🚰 Tekanan Air Pipa Rumah",
    "🚦 Kalkulator Kemacetan Jalan"
]

# Set default page in session state
if "active_page" not in st.session_state:
    st.session_state.active_page = "📊 Dashboard Utama"

# Sidebar selector
st.sidebar.title("🏛️ Menu Navigasi")
selected_page = st.sidebar.radio(
    "Pilih Modul Simulator", 
    page_options, 
    index=page_options.index(st.session_state.active_page)
)

# Handle sync between sidebar selection and button triggers
if selected_page != st.session_state.active_page:
    st.session_state.active_page = selected_page
    st.rerun()

# Routing to pages
if st.session_state.active_page == "📊 Dashboard Utama":
    page_home()
elif st.session_state.active_page == "🏗️ Simulasi Gedung Tahan Gempa":
    page_earthquake()
elif st.session_state.active_page == "🌉 Kelenturan Jembatan & Balok":
    page_steel_beam()
elif st.session_state.active_page == "💨 Kekuatan Gedung Menahan Angin":
    page_wind_load()
elif st.session_state.active_page == "🧪 Peracik Beton Ramah Lingkungan":
    page_concrete()
elif st.session_state.active_page == "📅 Penjadwalan Proyek Konstruksi":
    page_project_scheduling()
elif st.session_state.active_page == "🪨 Kekuatan Tanah Pondasi":
    page_soil_bearing()
elif st.session_state.active_page == "🧱 Dinding Penahan Tebing":
    page_retaining_wall()
elif st.session_state.active_page == "🌊 Bendungan Penangkal Banjir":
    page_hydrology()
elif st.session_state.active_page == "🚰 Tekanan Air Pipa Rumah":
    page_pipe_flow()
elif st.session_state.active_page == "🚦 Kalkulator Kemacetan Jalan":
    page_traffic_flow()