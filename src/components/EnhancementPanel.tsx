import { useState } from 'react';
import { Download, Printer, Share2, Heart, Sparkles, FolderHeart, Check, Info } from 'lucide-react';
import { StudioBackdrop, STUDIO_BACKDROPS } from '../types';

interface EnhancementPanelProps {
  selectedBackdropId: string | null;
  onSelectBackdrop: (id: string | null) => void;
  onDownload: () => void;
  onPrint: () => void;
  onShare: () => void;
  onSaveToHistory: () => void;
  isStagedForHistory: boolean;
  hasPhotos: boolean;
}

export default function EnhancementPanel({
  selectedBackdropId,
  onSelectBackdrop,
  onDownload,
  onPrint,
  onShare,
  onSaveToHistory,
  isStagedForHistory,
  hasPhotos
}: EnhancementPanelProps) {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'studio' | 'aesthetic' | 'outdoor' | 'solid'>('semua');
  const [notification, setNotification] = useState<string | null>(null);

  const categories = [
    { id: 'semua', name: 'Semua' },
    { id: 'studio', name: 'Studio' },
    { id: 'aesthetic', name: 'Aesthetic' },
    { id: 'outdoor', name: 'Alam / Outdoor' },
    { id: 'solid', name: 'Warna Solid' }
  ] as const;

  const filteredBackdrops = STUDIO_BACKDROPS.filter(
    b => activeCategory === 'semua' || b.category === activeCategory
  );

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveToHistoryLocal = () => {
    onSaveToHistory();
    triggerNotification("Strip Foto berhasil disimpan ke Galeri Riwayat lokal! ✨");
  };

  return (
    <div id="enhancement_options_panel" className="space-y-6">
      
      {/* 1. Studio Backdrops Swapping Deck */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
            AI Background & Backdrop Studio
          </h3>
          <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold">Chroma Blend</span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-2 border-b border-zinc-900/60 mb-4 pr-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 text-[10.5px] font-bold rounded-full transition shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-650 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Studio Backdrops list */}
        <div className="grid grid-cols-4 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
          {/* Transparent Backdrop (Reset) */}
          <button
            onClick={() => onSelectBackdrop(null)}
            className={`group relative flex flex-col items-center justify-center p-1 rounded-xl border aspect-square transition cursor-pointer bg-zinc-90 w-full ${
              selectedBackdropId === null
                ? 'border-indigo-500 bg-indigo-950/20' 
                : 'border-zinc-850 bg-zinc-900 hover:border-zinc-700'
            }`}
          >
            <div className="h-6 w-6 rounded-md border border-dashed border-zinc-700 bg-transparent flex items-center justify-center text-[10px]">❌</div>
            <span className="text-[7.5px] font-bold font-mono tracking-wide mt-1.5 uppercase text-center w-full truncate text-zinc-400">Default</span>
          </button>

          {filteredBackdrops.map((bd) => {
            const isSelected = selectedBackdropId === bd.id;
            return (
              <button
                key={bd.id}
                id={`backdrop_pill_${bd.id}`}
                onClick={() => onSelectBackdrop(bd.id)}
                className={`group relative flex flex-col items-center justify-center p-1 rounded-xl border aspect-square transition cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-950/20' 
                    : 'border-zinc-850 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                {/* Visual Backdrop swatch circle */}
                <div 
                  className="h-6 w-8 rounded-md shadow-inner"
                  style={{
                    background: bd.isGradient ? bd.value : undefined,
                    backgroundColor: !bd.isGradient ? bd.value : undefined
                  }}
                />
                
                <span className="text-[7.5px] font-display font-black tracking-wide mt-1.5 text-center w-full truncate leading-tight text-zinc-300">
                  {bd.name.replace("Studio ", "").replace("Minimalist ", "")}
                </span>

                {isSelected && (
                  <div className="absolute top-1 right-1 rounded-full bg-indigo-650 p-0.5 text-white">
                    <Check className="h-1.5 w-1.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. "Hasil Akhir" Export trigger deck */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
        <div>
          <h3 className="font-display text-sm font-extrabold text-white mb-1 flex items-center gap-1.5">
            <Heart className="h-4.5 w-4.5 text-pink-500" />
            Amankan Hasil Cetakanmu!
          </h3>
          <p className="text-[11px] text-zinc-500 leading-normal">
            Hasil cetakan dikomposisikan dalam HD 300DPI berkualitas tinggi untuk dicetak di kertas film asli atau dipajang di galeri.
          </p>
        </div>

        {/* Temporary Inside App Alert overlay */}
        {notification && (
          <div className="text-xs bg-emerald-950/60 text-emerald-400 p-3 rounded-xl border border-emerald-900/50 animate-fade-in flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0" /> {notification}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5">
          {/* Download PNG */}
          <button
            id="download_strip_btn"
            onClick={onDownload}
            disabled={!hasPhotos}
            className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
              hasPhotos
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 active:scale-95 cursor-pointer'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850'
            }`}
          >
            <Download className="h-4.5 w-4.5" /> Unduh Strip Foto (PNG HD)
          </button>

          {/* Save to history */}
          <button
            id="history_save_btn"
            disabled={!hasPhotos || isStagedForHistory}
            onClick={handleSaveToHistoryLocal}
            className={`w-full flex items-center justify-center gap-2.5 rounded-xl border py-3 text-sm font-semibold transition ${
              isStagedForHistory
                ? 'bg-zinc-950 border-emerald-900/60 text-emerald-500 cursor-not-allowed'
                : hasPhotos
                  ? 'border-zinc-805 bg-zinc-900 hover:bg-zinc-850 text-white cursor-pointer'
                  : 'border-zinc-900 bg-zinc-950 text-zinc-650 cursor-not-allowed'
            }`}
          >
            <FolderHeart className="h-4.5 w-4.5" /> 
            {isStagedForHistory ? 'Tersimpan di Riwayat!' : 'Simpan ke Galeri Riwayat'}
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Share link mockup */}
            <button
              id="share_strip_btn"
              disabled={!hasPhotos}
              onClick={onShare}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                hasPhotos
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 hover:text-white cursor-pointer'
                  : 'border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <Share2 className="h-4 w-4" /> Bagikan Link
            </button>

            {/* Direct Print */}
            <button
              id="print_strip_btn"
              disabled={!hasPhotos}
              onClick={onPrint}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${
                hasPhotos
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-850 hover:text-white cursor-pointer'
                  : 'border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <Printer className="h-4 w-4" /> Cetak Booth
            </button>
          </div>
        </div>
      </div>

      {/* Guide Info box */}
      <div className="rounded-2xl bg-zinc-900/30 border border-zinc-900 p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold">
          <Info className="h-4 w-4 shrink-0" />
          Cara Kerja AI Photo Booth:
        </div>
        <ol className="list-decimal list-inside space-y-2 text-[11px] text-zinc-400 leading-normal pl-0.5">
          <li>Upload foto dari galeri Anda atau ambil instan melalui kamera webcam di atas.</li>
          <li>Sematkan pakaian virtual atau buat judul label ribbons kertas pada panel kustomisasi.</li>
          <li>Klik <b className="text-indigo-300">"Buat Foto Berkelas dengan Gemini"</b> untuk memproses koreksi filter & stiker studio instan dari AI.</li>
          <li>Klik simpan, bagikan, atau langsung cetak kartu fotomu!</li>
        </ol>
      </div>

    </div>
  );
}
