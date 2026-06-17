import { MethodModal } from "@/components/shared/MethodModal"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { usePhysics } from "@/hooks/usePhysics"
import { useMetadata } from "@/hooks/useMetadata"
import { useState, useMemo, useRef } from "react"
import { calculateBeam as localCalculateBeam } from "@/lib/physics/models"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"
import { Settings2, Info, Loader2, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { pdf } from "@react-pdf/renderer"
import html2canvas from "html2canvas"
import { StandardReport } from "@/components/reports/StandardReport"
import { SteelBeam3D } from "@/components/visualizations/SteelBeam3D"

export function SteelBeamSim() { 
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [length, setLength] = useState(10)
  const [load, setLoad] = useState(50)
  const [profile, setProfile] = useState<string>("WF200")
  const [material, setMaterial] = useState<string>("BJ37")
  const [chartMode, setChartMode] = useState<"def" | "bmd" | "sfd" | "3d">("3d")
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null);

  const { metadata, isLoading: isMetaLoading } = useMetadata();

  const { result, isVerified, isValidating, error } = usePhysics(
    "calculateSteelBeam",
    (p) => localCalculateBeam(p.length, p.load, p.profileType, p.material, metadata),
    useMemo(() => ({ length, load, profileType: profile, material }), [length, load, profile, material])
  )
  
  const handleExportPDF = async () => {
    if (!result || !metadata) return;
    try {
      setIsExporting(true);
      let base64Image = '';
      if (exportRef.current) {
        const canvas = await html2canvas(exportRef.current, { scale: 2 });
        base64Image = canvas.toDataURL('image/png');
      }

      const profileLabel = metadata.STEEL_PROFILES[profile]?.label || profile;
      const materialLabel = metadata.STEEL_MATERIALS[material]?.label || material;

      const doc = <StandardReport 
        title="Desain Balok Baja I-WF" 
        subtitle="SNI 1729:2020 (LRFD)"
        inputs={[
          {label: "Bentang Balok", value: length + " m"},
          {label: "Beban Terpusat", value: load + " kN"},
          {label: "Profil Baja", value: profileLabel},
          {label: "Mutu Baja", value: materialLabel},
        ]}
        results={[
          {label: "Momen Maksimal (Mu)", value: result.maxMomen.toFixed(2) + " kNm"},
          {label: "Kapasitas Momen (ϕMn)", value: result.phiMn.toFixed(2) + " kNm", isAlert: result.maxMomen > result.phiMn},
          {label: "Gaya Geser (Vu)", value: result.maxGeser.toFixed(2) + " kN"},
          {label: "Lendutan Aktual", value: result.maxDeflection.toFixed(2) + " mm", isAlert: result.maxDeflection > result.limitDeflection},
        ]}
        conclusionMsg={result.msg}
        conclusionStatus={result.status}
        chartImageBase64={base64Image}
      />;
      
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Struktur_Balok_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      console.error("Gagal export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  const yDomainProp = useMemo(() => {
    if (!result) return [0, 100];
    if (chartMode === "def") return [-Math.max(100, Math.abs(result.maxDeflection) * 1.5), 100];
    const maxBmd = Math.max(...result.points.map(p => p.bmd));
    if (chartMode === "bmd") return [0, Math.max(10, maxBmd * 1.2)];
    const maxSfd = Math.max(...result.points.map(p => Math.abs(p.sfd)));
    return [-Math.max(10, maxSfd * 1.2), Math.max(10, maxSfd * 1.2)];
  }, [result, chartMode]);

  if (isMetaLoading || !result) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-civil-500" size={48} />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg flex flex-col md:flex-row">
      <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="z-20 w-full md:w-80 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-[var(--color-border)] flex flex-col bg-[var(--color-background)]/50">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-[var(--font-display)] font-bold flex items-center gap-2"><Settings2 size={18} className="text-civil-500" /> Analisis SNI 1729</h2>
          <VerificationBadge isVerified={isVerified} isValidating={isValidating} error={error} />
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div className="bg-civil-500/10 border border-civil-500/20 p-4 rounded-xl text-sm text-[var(--color-foreground)]">
            <p className="font-semibold text-civil-600 dark:text-civil-400 mb-1">Desain Balok Baja I-WF</p>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">Pengecekan kapasitas momen, geser, dan lendutan balok baja (simply supported) menahan beban terpusat di tengah bentang.</p>
            <div className="mt-3 flex items-center gap-2"><span className="bg-civil-500/20 text-civil-600 dark:text-civil-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-civil-500/30 cursor-pointer hover:bg-civil-500/30 hover:border-civil-500/50 select-none transition-colors" onClick={() => setShowMethodModal(true)}>METODE: SNI 1729:2020 (LRFD)</span></div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Mode Visualisasi</label>
            <div className="flex bg-[var(--color-secondary)] p-1 rounded-lg">
              {(["3d", "def", "bmd", "sfd"] as const).map(mode => (
                <button key={mode} onClick={() => setChartMode(mode)} className={cn("flex-1 text-[10px] font-bold py-1.5 rounded-md transition-colors", chartMode === mode ? "bg-[var(--color-background)] text-[var(--color-foreground)] shadow-sm" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]")}>
                  {mode === "3d" ? "3D VIEW" : mode === "def" ? "LENDUTAN" : mode === "bmd" ? "BMD" : "SFD"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Bentang (m)</label>
              <span className="text-sm font-mono font-bold bg-[var(--color-secondary)] px-2 py-0.5 rounded">{length} m</span>
            </div>
            <input type="range" min={2} max={12} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-civil-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Beban (kN)</label>
              <span className="text-sm font-mono font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded">{load} kN</span>
            </div>
            <input type="range" min={10} max={200} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full accent-destructive" />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Profil WF</label>
            <select value={profile} onChange={(e) => setProfile(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              {metadata && Object.entries(metadata.STEEL_PROFILES).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">Mutu Baja</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] text-sm">
              {metadata && Object.entries(metadata.STEEL_MATERIALS).map(([key, m]) => (
                <option key={key} value={key}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--color-border)]">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Unduh Laporan PDF
          </button>
        </div>
      </motion.div>

      <div className="relative flex-1 bg-[var(--color-background)]" ref={exportRef}>
        <div className="absolute inset-0 w-full h-full p-4 md:p-8 pb-40 pt-32">
          {chartMode === "3d" ? (
            <SteelBeam3D 
              length={length} 
              load={load} 
              profileHeight={metadata?.STEEL_PROFILES[profile]?.h || 200} 
              points={result.points} 
              status={result.status} 
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.points} key={chartMode}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
                <YAxis domain={yDomainProp} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />
                <Line type="monotone" dataKey={chartMode} stroke={chartMode === "def" ? "var(--color-civil-500)" : chartMode === "bmd" ? "#f59e0b" : "var(--color-destructive)"} strokeWidth={4} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-3 pointer-events-none flex-wrap justify-end">
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Momen (Mu)</span>
            <span className={cn("font-mono font-bold text-lg", result.maxMomen > result.phiMn ? "text-destructive" : "text-[var(--color-foreground)]")}>
              {result.maxMomen.toFixed(1)} <span className="text-xs text-[var(--color-muted-foreground)]">/ {result.phiMn.toFixed(1)}</span>
            </span>
          </div>
          <div className="glass-panel bg-[var(--color-background)]/80 backdrop-blur-md px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase hidden sm:block">Geser (Vu)</span>
            <span className={cn("font-mono font-bold text-lg", result.maxGeser > result.phiVn ? "text-destructive" : "text-[var(--color-foreground)]")}>
              {result.maxGeser.toFixed(1)} <span className="text-xs text-[var(--color-muted-foreground)]">/ {result.phiVn.toFixed(1)}</span>
            </span>
          </div>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={result.status}
            className={cn(
              "glass-panel px-6 py-4 rounded-xl max-w-2xl w-full flex items-start gap-4 shadow-xl border-l-4 backdrop-blur-md",
              result.status === "danger" ? "border-l-destructive bg-destructive/10 dark:bg-destructive/20" : 
              result.status === "warning" ? "border-l-warning bg-warning/10 dark:bg-warning/20" : "border-l-safe bg-safe/10 dark:bg-safe/20"
            )}
          >
            <div className={cn("p-2 rounded-full", result.status === "danger" ? "bg-destructive/20 text-destructive" : result.status === "warning" ? "bg-warning/20 text-warning" : "bg-safe/20 text-safe")}>
              <Info size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1 uppercase tracking-wider">{result.status === "safe" ? "Struktur Aman" : "Peringatan Struktur"}</h3>
              <p className="text-sm font-medium leading-relaxed text-[var(--color-foreground)]">{result.msg}</p>
            </div>
          </motion.div>
        </div>
      </div>
      <MethodModal isOpen={showMethodModal} onClose={() => setShowMethodModal(false)} method="steel_beam" />
    </div>
  )
}
