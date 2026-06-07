import { Sparkles, Sliders, CheckCircle, RefreshCw, X, Tag } from 'lucide-react';
import { AIReviewResponse } from '../types';

interface AIReviewCardProps {
  review: AIReviewResponse | null;
  onApplyDials: (dials: AIReviewResponse['recommendedDials']) => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function AIReviewCard({ review, onApplyDials, onClear, isLoading }: AIReviewCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-800/40 bg-zinc-950 p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
        {/* Shimmer loading */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-550/5 to-transparent shimmer opacity-40" />
        
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950/80 p-0.5 border border-indigo-900/60 float-animate">
          <Sparkles className="h-6 w-6 text-indigo-400 rotate-12" />
        </div>
        
        <div>
          <h4 className="font-display text-base font-bold text-white flex items-center gap-1 justify-center">
            Menganalisis Snap Booth...
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Gemini sedang memindai pose, kualitas cahaya, pakaian, dan mood foto Anda untuk menghasilkan overlay estetik khusus dan tips fotografer profesional...
          </p>
        </div>

        <div className="w-full max-w-md bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
          <div className="bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-400 h-full w-4/5 rounded-full animate-pulse" />
        </div>

        <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400/80 animate-pulse">
          Mengomposisi Frame & Overlay Unik
        </span>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div id="ai_review_card" className="rounded-2xl border border-indigo-500/30 bg-zinc-950 p-5 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient background radial glows */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900/50 border border-indigo-500/20">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-display text-sm font-extrabold text-white">Rekomendasi Gemini AI</h4>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Direktur Seni Digital Pribadi</span>
          </div>
        </div>
        <button id="clear_ai_review_btn" onClick={onClear} className="rounded-full p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Persona Header Badge */}
      <div className="mb-4">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">Gaya Persona Hasil Scan</span>
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-950 via-pink-950 to-amber-950 border border-indigo-550/40 px-3.5 py-1.5 shadow-md shadow-pink-500/5">
          <Tag className="h-3.5 w-3.5 text-pink-400 rotate-95" />
          <span className="font-display text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-amber-300">
            {review.persona}
          </span>
        </div>
      </div>

      {/* Analysis text */}
      <div className="space-y-4 mb-5">
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1">Analisis Fotografer</span>
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
            "{review.analysis}"
          </p>
        </div>

        {/* Tips bullet point lists */}
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">Tips Pose & Studio</span>
          <ul className="space-y-2">
            {review.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-zinc-400 leading-relaxed items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-90 w-5 text-indigo-400 font-mono text-[10px] font-bold border border-zinc-800">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action panel to apply recommended dials */}
      <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/40 p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <Sliders className="h-4 w-4 text-indigo-400" /> Dial Rekomendasi AI
          </span>
          <span className="font-mono text-[10px] text-zinc-500">Auto-Refine Params</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4 text-[10px] font-mono text-zinc-400 border-b border-zinc-900/60 pb-3">
          <div className="flex justify-between">
            <span>Kecerahan:</span>
            <b className={review.recommendedDials.brightnessOffset >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {review.recommendedDials.brightnessOffset > 0 ? "+" : ""}{review.recommendedDials.brightnessOffset}%
            </b>
          </div>
          <div className="flex justify-between">
            <span>Kontras:</span>
            <b className={review.recommendedDials.contrastOffset >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {review.recommendedDials.contrastOffset > 0 ? "+" : ""}{review.recommendedDials.contrastOffset}%
            </b>
          </div>
          <div className="flex justify-between">
            <span>Saturasi:</span>
            <b className={review.recommendedDials.saturationOffset >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {review.recommendedDials.saturationOffset > 0 ? "+" : ""}{review.recommendedDials.saturationOffset}%
            </b>
          </div>
          <div className="flex justify-between">
            <span>Soft Glow:</span>
            <b className="text-indigo-400">+{review.recommendedDials.blurSoftness}px</b>
          </div>
          <div className="flex justify-between col-span-2">
            <span>Vignette Estetik:</span>
            <b className="text-indigo-450 text-indigo-400">{review.recommendedDials.vignetteLevel}%</b>
          </div>
        </div>

        <button
          id="apply_recommended_dials_btn"
          onClick={() => onApplyDials(review.recommendedDials)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-650/20 hover:from-indigo-500 hover:to-pink-500 transition-all cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" /> Sesuaikan Parameter Foto Sekarang
        </button>
      </div>

      <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-505 font-mono px-1">
        <span className="text-zinc-600">Ribbon Label:</span>
        <span className="text-zinc-400 font-bold uppercase truncate max-w-[200px]">{review.customStripLabel}</span>
      </div>

    </div>
  );
}
