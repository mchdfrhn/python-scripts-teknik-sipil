import { 
  Building2, 
  Wind, 
  Droplets, 
  MountainSnow, 
  FlaskConical, 
  CalendarClock, 
  TrafficCone, 
  Waves,
  Hammer,
  KanbanSquare
} from "lucide-react"

export const MODULES = [
  {
    id: "earthquake",
    path: "/earthquake",
    icon: Building2,
    title: "Simulasi Gedung Tahan Gempa",
    shortTitle: "Gempa",
    description: "Analisis osilasi harmonik dan redaman (damping) gedung bertingkat saat menerima beban gempa lateral.",
    category: "struktur",
    size: "large" // Untuk Bento Grid
  },
  {
    id: "steel-beam",
    path: "/steel-beam",
    icon: Hammer,
    title: "Kelenturan Jembatan & Balok",
    shortTitle: "Balok Baja",
    description: "Kalkulasi diagram gaya geser (SFD), momen lentur (BMD), dan defleksi balok akibat beban.",
    category: "struktur",
    size: "medium"
  },
  {
    id: "wind-load",
    path: "/wind-load",
    icon: Wind,
    title: "Kekuatan Gedung Menahan Angin",
    shortTitle: "Beban Angin",
    description: "Evaluasi tekanan angin (wind pressure) pada fasad gedung sesuai standar kecepatan angin.",
    category: "struktur",
    size: "medium"
  },
  {
    id: "concrete",
    path: "/concrete",
    icon: FlaskConical,
    title: "Peracik Beton Ramah Lingkungan",
    shortTitle: "Beton Eco",
    description: "Optimasi Faktor Air Semen (FAS) dan campuran material (Fly Ash) untuk beton mutu tinggi rendah karbon.",
    category: "material",
    size: "medium"
  },
  {
    id: "scheduling",
    path: "/scheduling",
    icon: CalendarClock,
    title: "Penjadwalan Proyek Konstruksi",
    shortTitle: "Penjadwalan",
    description: "Manajemen waktu proyek dengan metode Jalur Kritis (Critical Path Method) dan Gantt Chart.",
    category: "material",
    size: "medium"
  },
  {
    id: "soil-bearing",
    path: "/soil-bearing",
    icon: MountainSnow,
    title: "Kekuatan Tanah Pondasi",
    shortTitle: "Tanah Pondasi",
    description: "Analisis daya dukung tanah (Terzaghi) untuk menentukan dimensi pondasi dangkal yang aman.",
    category: "geoteknik",
    size: "large"
  },
  {
    id: "retaining-wall",
    path: "/retaining-wall",
    icon: KanbanSquare,
    title: "Dinding Penahan Tebing",
    shortTitle: "Dinding Tebing",
    description: "Pengecekan faktor keamanan (Safety Factor) dinding penahan tanah terhadap guling dan geser.",
    category: "geoteknik",
    size: "medium"
  },
  {
    id: "hydrology",
    path: "/hydrology",
    icon: Waves,
    title: "Bendungan Penangkal Banjir",
    shortTitle: "Bendungan",
    description: "Simulasi penelusuran banjir (flood routing) waduk untuk memitigasi debit puncak limpasan air.",
    category: "air",
    size: "large"
  },
  {
    id: "pipe-flow",
    path: "/pipe-flow",
    icon: Droplets,
    title: "Tekanan Air Pipa Rumah",
    shortTitle: "Pipa Air",
    description: "Perhitungan kehilangan energi (head loss) akibat friksi pada jaringan pipa air bersih.",
    category: "air",
    size: "medium"
  },
  {
    id: "traffic",
    path: "/traffic",
    icon: TrafficCone,
    title: "Kalkulator Kemacetan Jalan",
    shortTitle: "Macet Jalan",
    description: "Evaluasi Tingkat Pelayanan (Level of Service) dan kepadatan arus lalu lintas perkotaan.",
    category: "air",
    size: "medium"
  },
] as const

export type ModuleId = (typeof MODULES)[number]["id"]

export const CATEGORIES = [
  { id: "struktur", label: "Rekayasa Struktur", color: "blue" },
  { id: "material", label: "Material & Manajemen", color: "emerald" },
  { id: "geoteknik", label: "Geoteknik & Tanah", color: "amber" },
  { id: "air", label: "Hidrologi & Lalu Lintas", color: "cyan" },
] as const
