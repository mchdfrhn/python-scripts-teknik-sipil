import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, FileText } from "lucide-react"

export type MethodType = 
  | "concrete"
  | "earthquake"
  | "hydrology"
  | "pipe_flow"
  | "retaining_wall"
  | "scheduling"
  | "soil_bearing"
  | "steel_beam"
  | "traffic"
  | "wind_load"

interface MethodModalProps {
  isOpen: boolean
  onClose: () => void
  method: MethodType
}

const METHOD_DETAILS: Record<MethodType, { title: string, subtitle: string, standard: string, content: React.ReactNode }> = {
  concrete: {
    title: "Proporsi Campuran Beton (Mix Design)",
    subtitle: "Kalkulasi takaran semen, air, dan agregat dengan substitusi fly ash.",
    standard: "SNI 2847:2019 & ACI 211.1",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Metode <strong>ACI 211.1</strong> menetapkan proporsi campuran beton berdasarkan kekuatan tekan target (<span className="font-mono text-[var(--color-foreground)]">fc'</span>), konsistensi adukan (slump), ukuran agregat maksimum, dan densitas material penyusun.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          Rumus Kadar Semen Efektif:<br/>
          C_efektif = C_total * (1 - %Fly_Ash / 100)<br/>
          Fly_Ash = C_total * (%Fly_Ash / 100)
        </div>
        <p>
          Berdasarkan <strong>SNI 2847:2019</strong>, material sementisius alternatif seperti <em>fly ash</em> (abu terbang limbah batubara) dapat menggantikan sebagian semen Portland tipe I hingga batas maksimum 30-40% untuk menjaga reaksi hidrasi awal dan kekuatan tekan jangka panjang.
        </p>
      </div>
    )
  },
  earthquake: {
    title: "Analisis Gempa Statik Ekuivalen",
    subtitle: "Analisis beban gempa horizontal pada gedung bertingkat.",
    standard: "SNI 1726:2019",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Menghitung respons beban gempa menggunakan metode gaya geser dasar seismik horizontal ekuivalen pada struktur bangunan gedung.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          Gaya Geser Dasar: V = Cs * W<br/>
          Koefisien Seismik: Cs = Sds / (R / Ie) (batas min: 0.044 * Sds * Ie)
        </div>
        <p>
          <strong>Simpangan Izin (Drift Limit):</strong> Berdasarkan SNI 1726 Pasal 7.8.6, simpangan antar lantai desain tidak boleh melebihi <span className="font-mono text-[var(--color-foreground)]">Δa = 0.020 * hsx</span> (untuk gedung kategori risiko biasa) untuk menjamin struktur tetap daktail dan tidak runtuh secara mendadak.
        </p>
      </div>
    )
  },
  hydrology: {
    title: "Analisis Debit Banjir Puncak",
    subtitle: "Menghitung kapasitas debit aliran limpasan sungai.",
    standard: "Metode Rasional (Q = 0.278 * C * I * A)",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Metode Rasional merupakan metode empiris yang sangat andal dan populer untuk memprediksi debit puncak limpasan air permukaan dari suatu Daerah Aliran Sungai (DAS) mikro (luasan kurang dari 80 Hektar).
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          Debit Limpasan: Q = 0.278 * C * I * A<br/>
          C = Koefisien Limpasan (Tutupan Lahan)<br/>
          I = Intensitas Hujan (mm/jam)<br/>
          A = Luas DAS (km²)
        </div>
        <p>
          Koefisien Limpasan (<span className="font-mono text-[var(--color-foreground)]">C</span>) menggambarkan persentase curah hujan yang langsung mengalir menjadi limpasan (runoff) permukaan dan tidak meresap ke dalam tanah (infiltrasi). Jalan aspal memiliki C ~ 0.90, sementara hutan lebat memiliki C ~ 0.10.
        </p>
      </div>
    )
  },
  pipe_flow: {
    title: "Aliran Fluida Dalam Pipa Tertutup",
    subtitle: "Menghitung kehilangan tekanan akibat gesekan pipa air.",
    standard: "Persamaan Hazen-Williams",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Persamaan empiris Hazen-Williams digunakan untuk menganalisis penurunan tinggi tekan (head loss) akibat gesekan hidrolik sepanjang dinding pipa berpenampang lingkaran penuh.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          Head Loss: hf = 10.67 * L * (Q / C)^1.852 / D^4.87<br/>
          L = Panjang Pipa (m), D = Diameter Dalam (m)<br/>
          C = Koefisien Kekasaran Pipa (PVC = 150, Besi Cor = 100)
        </div>
        <p>
          Nilai koefisien kekasaran pipa (<span className="font-mono text-[var(--color-foreground)]">C</span>) yang tinggi merepresentasikan permukaan pipa bagian dalam yang sangat halus, yang berdampak pada rendahnya kehilangan tekanan sisa (headloss) sepanjang rute distribusi.
        </p>
      </div>
    )
  },
  retaining_wall: {
    title: "Dinding Penahan Tanah Kantilever",
    subtitle: "Menganalisis keamanan dinding penahan terhadap tekanan tanah aktif.",
    standard: "Teori Tekanan Tanah Rankine & Cek Stabilitas",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Teori Rankine berasumsi bahwa tanah berada dalam kondisi keseimbangan plastis tanpa adanya gaya gesek antara dinding penahan dengan tanah di belakangnya.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          {"Koefisien Tekanan Aktif: Ka = tan²(45° - φ/2)"}<br/>
          {"Gaya Dorong Aktif: Pa = 0.5 * γ * H² * Ka"}<br/>
          {"SF Guling = Resisting Moment / Overturning Moment (Target >= 1.5)"}
        </div>
        <p>
          Untuk memastikan stabilitas konstruksi penahan tebing, rasio penahan (torsi berat dinding sendiri) dibagi torsi guling tanah aktif (SF Guling), serta ketahanan friksi dasar pondasi dibagi gaya dorong horizontal tanah (SF Geser) harus bernilai minimal 1.50.
        </p>
      </div>
    )
  },
  scheduling: {
    title: "Penjadwalan Proyek Konstruksi",
    subtitle: "Menganalisis jalur kritis durasi pembangunan proyek.",
    standard: "Critical Path Method (CPM)",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Critical Path Method (CPM) adalah teknik analisis jaringan kerja untuk merencanakan dan menjadwalkan proyek konstruksi. Jalur kritis mendefinisikan rangkaian pekerjaan yang tidak boleh terlambat (memiliki <em>free float = 0</em>).
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          {"Float (Slack) = Late Start (LS) - Early Start (ES)"}<br/>
          {"Aktivitas dengan Float = 0 berada pada Jalur Kritis."}<br/>
          {"Keterlambatan jalur kritis = Menunda total proyek!"}
        </div>
        <p>
          Aktivitas non-kritis memiliki kelonggaran waktu (float) positif. Pengelola proyek dapat menunda atau mengalokasikan ulang sumber daya dari aktivitas non-kritis ke aktivitas kritis tanpa mengganggu waktu penyelesaian akhir proyek.
        </p>
      </div>
    )
  },
  soil_bearing: {
    title: "Kapasitas Daya Dukung Pondasi Dangkal",
    subtitle: "Menghitung kekuatan tanah dasar memikul beban bangunan.",
    standard: "Persamaan Meyerhof & Terzaghi",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Meyerhof menyempurnakan persamaan kapasitas daya dukung Terzaghi dengan memperkenalkan faktor koreksi bentuk pondasi, kedalaman tanam pondasi (<span className="font-mono text-[var(--color-foreground)]">Df</span>), dan sudut kemiringan beban luar.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          {"Daya Dukung Ultimit (Meyerhof Square Footing):"}<br/>
          {"q_ult = (1.3 * c * Nc) + (q * Nq) + (0.4 * γ * B * Nγ)"}<br/>
          {"Daya Dukung Izin: q_all = q_ult / SF (SF desain = 3.0)"}
        </div>
        <p>
          Faktor <span className="font-mono text-[var(--color-foreground)]">Nc, Nq, Nγ</span> secara eksklusif dikalkulasikan dari nilai sudut geser dalam tanah (<span className="font-mono text-[var(--color-foreground)]">φ</span>). Nilai kohesi tanah (<span className="font-mono text-[var(--color-foreground)]">c</span>) memegang peranan vital pada kekuatan tanah lempung (kohesif).
        </p>
      </div>
    )
  },
  steel_beam: {
    title: "Desain Lentur & Geser Balok Baja I-WF",
    subtitle: "Pengecekan lendutan dan batas plastis profil baja.",
    standard: "SNI 1729:2020 / AISC 360",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Metode <strong>LRFD (Load and Resistance Factor Design)</strong> memisahkan faktor pengali beban dengan faktor reduksi kekuatan material guna memastikan probabilitas kegagalan struktur yang sangat minim.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          {"Kapasitas Momen: Mu <= φ * Mn (φ = 0.90, Mn = Fy * Zx)"}<br/>
          {"Kapasitas Geser: Vu <= φ * Vn (φ = 0.90, Vn = 0.6 * Fy * Aw * Cv)"}<br/>
          {"Batas Lendutan Aktual: δ <= L / 240"}
        </div>
        <p>
          Kapasitas lentur nominal (<span className="font-mono text-[var(--color-foreground)]">Mn</span>) dari profil baja kompak ditentukan berdasarkan momen batas plastis penampang (kondisi leleh penuh). Pengecekan stabilitas lateral (*Lateral Torsional Buckling*) wajib dilakukan jika balok tidak ditumpu lateral.
        </p>
      </div>
    )
  },
  traffic: {
    title: "Kapasitas & Tingkat Pelayanan Jalan",
    subtitle: "Menilai kenyamanan berkendara dan derajat kejenuhan jalan.",
    standard: "Manual Kapasitas Jalan Indonesia (MKJI) 1997",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          MKJI 1997 menetapkan kapasitas jalan perkotaan dengan mengoreksi kapasitas dasar awal jalan berdasarkan lebar jalur, hambatan samping, dan ukuran kota.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          {"Kapasitas Riil: C = C0 * Lajur * FCw * FCsp * FCsf * FCcs"}<br/>
          {"Derajat Kejenuhan: DS = Volume Lalu Lintas / C"}<br/>
          {"Level of Service (LOS): A (DS <= 0.45) s.d F (DS >= 1.0)"}
        </div>
        <p>
          Tingkat Pelayanan Jalan (*Level of Service*) bernilai <strong>D</strong> ke atas merupakan kondisi jalan yang sudah jenuh, ditandai dengan lalu lintas yang mulai padat merayap, kecepatan menurun drastis, dan manuver pengemudi terbatasi.
        </p>
      </div>
    )
  },
  wind_load: {
    title: "Analisis Beban Angin Desain Gedung",
    subtitle: "Menghitung distribusi tekanan tiupan angin pada dinding gedung.",
    standard: "SNI 1727:2020 / ASCE 7",
    content: (
      <div className="space-y-4 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        <p>
          Menghitung beban angin berdasarkan prosedur utama (Main Wind Force Resisting System / MWFRS) untuk bangunan gedung kaku.
        </p>
        <div className="bg-civil-500/10 border border-civil-500/20 p-3 rounded-lg text-xs font-mono text-[var(--color-foreground)]">
          Tekanan Kecepatan: qz = 0.613 * Kz * Kzt * Kd * V² (N/m²)<br/>
          Kz = Koefisien eksposur tinggi berdasarkan ketinggian gedung<br/>
          V = Kecepatan angin dasar (m/s)
        </div>
        <p>
          <strong>Kategori Eksposur:</strong> Eksposur B mewakili perkotaan padat berpenghalang tinggi (tekanan angin tereduksi), Eksposur C mewakili medan terbuka pedesaan, dan Eksposur D mewakili tepian air laut datar dengan kecepatan sapuan angin maksimal.
        </p>
      </div>
    )
  }
}

export function MethodModal({ isOpen, onClose, method }: MethodModalProps) {
  const data = METHOD_DETAILS[method]
  if (!data) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl backdrop-blur-xl animate-in"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4 mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-civil-500/10 text-civil-500">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] font-bold text-base text-[var(--color-foreground)]">
                    {data.title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {data.subtitle}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--color-secondary)] transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Standard Tag */}
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-civil-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-civil-600 dark:text-civil-400">
                {data.standard}
              </span>
            </div>

            {/* Content Body */}
            <div className="my-2 max-h-[60vh] overflow-y-auto pr-1">
              {data.content}
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-[var(--color-border)] pt-4 flex justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
