import React from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified: boolean;
  isValidating: boolean;
  error: Error | null | unknown;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  isValidating,
  error,
  className
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-300 shadow-sm",
        isValidating
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
          : error
          ? "bg-red-500/10 text-red-500 border-red-500/20"
          : isVerified
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          : "bg-slate-500/10 text-slate-500 border-slate-500/20",
        className
      )}
    >
      {isValidating ? (
        <>
          <Loader2 size={12} className="animate-spin text-amber-500" />
          <span>Memvalidasi...</span>
        </>
      ) : error ? (
        <>
          <AlertTriangle size={12} className="text-red-500" />
          <span>Engine Gagal</span>
        </>
      ) : isVerified ? (
        <>
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span>Engine Python</span>
        </>
      ) : (
        <>
          <AlertTriangle size={12} className="text-slate-400" />
          <span>Kalkulasi Lokal (Offline)</span>
        </>
      )}
    </div>
  );
};
