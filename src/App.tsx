import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Upload, Camera, Download, Trash2, Layout, Image, Plus, Heart, HelpCircle, History, Info, ChevronLeft, Calendar, FileDown } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CameraModal from './components/CameraModal';
import AIReviewCard from './components/AIReviewCard';
import StripCanvas, { StripCanvasRef } from './components/StripCanvas';
import EditorWorkspace from './components/EditorWorkspace';
import EnhancementPanel from './components/EnhancementPanel';

import { 
  LayoutPreset, LAYOUT_PRESETS,
  VisualFilter, VISUAL_FILTERS,
  StudioBackdrop, STUDIO_BACKDROPS,
  PhotoFrameState, AdjustmentSettings,
  DEFAULT_ADJUSTMENTS, StickerState, AIReviewResponse
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'vibes' | 'history' | 'settings'>('editor');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [activeLayout, setActiveLayout] = useState<LayoutPreset>(LAYOUT_PRESETS[0]); // vertical 4-strip by default
  const [frames, setFrames] = useState<PhotoFrameState[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentSettings>(DEFAULT_ADJUSTMENTS);
  const [selectedBackdropId, setSelectedBackdropId] = useState<string | null>(null);
  const [frameColor, setFrameColor] = useState<string>('#ffffff');
  const [stripLabel, setStripLabel] = useState<string>('SEOUL AI PHOTO STUDIO');
  const [stripSubtitle, setStripSubtitle] = useState<string>('MEMORIES IN FRAME');
  const [stickers, setStickers] = useState<StickerState[]>([]);
  const [aiReview, setAiReview] = useState<AIReviewResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<{ id: string; image: string; layoutName: string; timestamp: string }[]>([]);
  
  // Track if current designed strip is saved to history list (to prevent duplication)
  const [isStagedForHistory, setIsStagedForHistory] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<StripCanvasRef>(null);

  // Initialize photo frame states depending on selected layout count
  useEffect(() => {
    setFrames((prev) => {
      const initialized: PhotoFrameState[] = [];
      for (let i = 0; i < activeLayout.frameCount; i++) {
        // preserve existing photo if switching frames count
        const existing = prev[i];
        initialized.push({
          id: i,
          image: existing?.image || null,
          rawImage: existing?.rawImage || null,
          mirrored: existing?.mirrored || false,
          filterId: existing?.filterId || 'none',
          outfitId: existing?.outfitId || null,
        });
      }
      return initialized;
    });
    setAiReview(null);
    setIsStagedForHistory(false);
  }, [activeLayout]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_photobooth_history');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Gagal memuat riwayat lokal:", e);
    }
  }, []);

  // Save history helper
  const saveToHistoryDb = (updated: typeof historyList) => {
    setHistoryList(updated);
    try {
      localStorage.setItem('ai_photobooth_history', JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menyimpan riwayat ke storage:", e);
    }
  };

  const handleUpdateFrame = (idx: number, updates: Partial<PhotoFrameState>) => {
    setFrames(prev => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], ...updates };
      }
      return copy;
    });
    setIsStagedForHistory(false);
  };

  const handleUpdateAdjustments = (updates: Partial<AdjustmentSettings>) => {
    setAdjustments(prev => ({ ...prev, ...updates }));
    setIsStagedForHistory(false);
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setIsStagedForHistory(false);
  };

  // Convert uploaded image file or camera snapshot into base64
  const processImageBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Files uploading processor supporting multiple drops
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // populate selected frame slot
      try {
        const base64 = await processImageBase64(files[0]);
        // Put in first empty or current active frame
        const emptyIdx = frames.findIndex(f => !f.image);
        const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
        
        handleUpdateFrame(targetIdx, { image: base64, rawImage: base64 });
      } catch (err) {
        console.error("Gagal mendecode file:", err);
      }
    } else {
      // distribute files sequentially to frame slots
      const limit = Math.min(files.length, activeLayout.frameCount);
      for (let i = 0; i < limit; i++) {
        try {
          const base64 = await processImageBase64(files[i]);
          handleUpdateFrame(i, { image: base64, rawImage: base64 });
        } catch (err) {
          console.error(`Gagal mendecode file ${i}:`, err);
        }
      }
    }
    
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger hidden input trigger
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle capture completed in Webcam modal
  const handlePhotosCaptured = (images: string[]) => {
    images.forEach((img, idx) => {
      if (img && idx < activeLayout.frameCount) {
        handleUpdateFrame(idx, { image: img, rawImage: img });
      }
    });
  };

  // Apply Catalog styles presets
  const handleApplyVibeFilter = (vib: VisualFilter) => {
    // Generate beautiful labels based on filter
    setStripLabel(`${vib.tagline.toUpperCase()}`);
    setStripSubtitle(`STYLED WITH ${vib.name.toUpperCase()}`);
    
    // Set custom visual sliders to match vibes
    if (vib.id === 'natural_korea') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, brightness: 12, contrast: -5, saturation: 4, blur: 2, vignette: 5 });
      setSelectedBackdropId('backdrop_studio_beige');
      setFrameColor('#ffffff');
    } else if (vib.id === 'vintage_90s') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, sepia: 25, grain: 35, contrast: 10, brightness: -2, saturation: 10, vignette: 20 });
      setSelectedBackdropId('backdrop_aesthetic_arch');
      setFrameColor('#faf0d7'); // cream frame
    } else if (vib.id === 'cyberpunk_neon') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, contrast: 25, saturation: 40, brightness: 5, vignette: 30 });
      setSelectedBackdropId('backdrop_studio_blue');
      setFrameColor('#111111'); // black frame
    } else if (vib.id === 'classic_noir') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, sepia: 0, contrast: 30, saturation: -40, brightness: -5, vignette: 40 });
      setSelectedBackdropId('solid_black');
      setFrameColor('#ffffff'); // high contrast noir frame
    } else if (vib.id === 'soft_bloom') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, brightness: 15, contrast: -10, saturation: -5, blur: 4, vignette: 10 });
      setSelectedBackdropId('backdrop_aesthetic_lavender');
      setFrameColor('#ffd3e1'); // pink frame
    } else if (vib.id === 'golden_hour') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, sepia: 35, brightness: 8, contrast: 5, saturation: 15, grain: 15 });
      setSelectedBackdropId('backdrop_outdoor_sunset');
      setFrameColor('#fdfbf7');
    } else if (vib.id === 'emerald_indie') {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, grain: 20, contrast: 8, brightness: 2, saturation: -10, sepia: 10 });
      setSelectedBackdropId('backdrop_outdoor_forest');
      setFrameColor('#e2f9e1');
    }
    
    // Navigate home to see results
    setCurrentView('editor');
  };

  // Invoke Gemini's analysis route via server-side Proxy
  const handleTriggerGementor = async (userPrompt: string, styleMode: string) => {
    // Find representative photo to analyze. Prefer Frame index 0 or first completed slot.
    const representativeFrame = frames.find(f => f.image) || frames[0];
    if (!representativeFrame || !representativeFrame.image) {
      alert("⚠️ Mohon upload atau ambil setidaknya satu foto terlebih dahulu sebelum menggunakan fitur AI!");
      return;
    }

    setAiLoading(true);
    setAiReview(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: representativeFrame.image,
          mode: styleMode,
          userPrompt: userPrompt,
          currentSettings: adjustments
        })
      });

      if (!response.ok) {
        throw new Error("Respon server bermasalah.");
      }

      const data: AIReviewResponse = await response.json();
      setAiReview(data);

      // Program labels directly from AI suggestions
      if (data.customStripLabel) setStripLabel(data.customStripLabel.toUpperCase());
      if (data.customSubtitle) setStripSubtitle(data.customSubtitle.toUpperCase());

      // Inject custom stickers from Gemini directly onto the strip
      if (data.stickersToInclude && data.stickersToInclude.length > 0) {
        const generatedStickers: StickerState[] = data.stickersToInclude.map((st, i) => ({
          id: `ai_sticker_${Date.now()}_${i}`,
          text: st.text,
          colorStyle: st.colorStyle,
          xPercent: st.xPercent,
          yPercent: st.yPercent
        }));
        setStickers(prev => {
          // preserve user custom stickers, filter old AI stickers, append new AI stickers
          const userStickers = prev.filter(s => !s.id.startsWith('ai_sticker_'));
          return [...userStickers, ...generatedStickers];
        });
      }

    } catch (err: any) {
      console.error("AI processing failed:", err);
      alert("Gagal menghubungi AI Studio. Hubungkan kembali atau pastikan API Key terkonfigurasi di Secrets.");
    } finally {
      setAiLoading(false);
    }
  };

  // Apply dials directly from prompt cards
  const handleApplyAIDials = (dials: AIReviewResponse['recommendedDials']) => {
    setAdjustments({
      brightness: Math.round(dials.brightnessOffset),
      contrast: Math.round(dials.contrastOffset),
      saturation: Math.round(dials.saturationOffset),
      blur: Math.round(dials.blurSoftness),
      vignette: Math.round(dials.vignetteLevel),
      sepia: adjustments.sepia, // retain existing sepia or other styles
      grain: adjustments.grain || 10
    });
  };

  // Sticker operations
  const handleAddSticker = (text: string, color: string) => {
    const fresh: StickerState = {
      id: `user_sticker_${Date.now()}`,
      text: text,
      colorStyle: color,
      xPercent: 40 + Math.random() * 20,
      yPercent: 30 + Math.random() * 20
    };
    setStickers(prev => [...prev, fresh]);
  };

  const handleRemoveSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStickerPos = (id: string, x: number, y: number) => {
    setStickers(prev => {
      const copy = [...prev];
      const matchIdx = copy.findIndex(s => s.id === id);
      if (matchIdx !== -1 && copy[matchIdx]) {
        copy[matchIdx] = { ...copy[matchIdx], xPercent: x, yPercent: y };
      }
      return copy;
    });
  };

  // Image Downloads
  const handleDownloadStrip = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await canvasRef.current.exportToImage();
      const link = document.createElement('a');
      link.download = `photobooth_ai_${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Gagal mendownload:", e);
    }
  };

  // Web printable cards
  const handlePrintStrip = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await canvasRef.current.exportToImage();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cetak Photo Booth</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; background-color: #f0f0f0; height: 100vh; }
                img { max-height: 98vh; max-width: 98vw; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; }
                @media print {
                  body { background: none; }
                  img { max-height: 100vh; max-width: 100vw; box-shadow: none; }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (e) {
      console.error("Gagal mencetak:", e);
    }
  };

  // Copy sharing link
  const handleShareStrip = () => {
    const fakeURL = `${window.location.origin}/share/booth-${Date.now().toString(36)}`;
    navigator.clipboard.writeText(fakeURL);
    alert(`🔗 Link sharing simulasi berhasil disalin ke clipboard!\n\n${fakeURL}`);
  };

  // History save lists
  const handleSaveToHistoryState = async () => {
    if (!canvasRef.current) return;
    try {
      const base64Png = await canvasRef.current.exportToImage();
      const freshList = [
        {
          id: `saved_strip_${Date.now()}`,
          image: base64Png,
          layoutName: activeLayout.name,
          timestamp: new Date().toLocaleDateString('id-ID', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric'
          })
        },
        ...historyList
      ];
      saveToHistoryDb(freshList);
      setIsStagedForHistory(true);
    } catch (e) {
      console.error("Gagal menyimpan ke riwayat:", e);
    }
  };

  const handleClearHistoryItem = (id: string) => {
    const filtered = historyList.filter(item => item.id !== id);
    saveToHistoryDb(filtered);
  };

  const hasPhotos = frames.some(f => f.image !== null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-sans antialiased">
      
      {/* Invisible global input trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Webcam modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        frameCountNeeded={activeLayout.frameCount}
        onPhotosCaptured={handlePhotosCaptured}
      />

      {/* App Left Sidebar */}
      <Sidebar
        onUploadClick={handleTriggerUpload}
        onCameraClick={() => setIsCameraOpen(true)}
        onNavigate={setCurrentView}
        currentView={currentView}
        historyCount={historyList.length}
      />

      {/* Main Container Workfields */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-900/60 p-4 min-w-0 md:p-6">
        
        {/* SUB ROUTE 1: Editor/Home workspace */}
        {currentView === 'editor' && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
            
            {/* Live interactive previews and output canvas rendering (Center area) */}
            <div className="xl:col-span-5 flex flex-col justify-center items-center py-2 h-full">
              <span className="text-[10px] w-full max-w-[280px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3 block text-center">Hasil Desain Instan</span>
              <StripCanvas
                ref={canvasRef}
                layout={activeLayout}
                frames={frames}
                adjustments={adjustments}
                stickers={stickers}
                frameColor={frameColor}
                stripLabel={stripLabel}
                stripSubtitle={stripSubtitle}
                selectedBackdropId={selectedBackdropId}
                onRemoveSticker={handleRemoveSticker}
                onUpdateStickerPos={handleUpdateStickerPos}
              />
            </div>

            {/* Editing controllers (Right workspace) */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* If Gemini AI generated a response, render the review panel prominently */}
              {(aiLoading || aiReview) && (
                <AIReviewCard
                  review={aiReview}
                  isLoading={aiLoading}
                  onClear={() => setAiReview(null)}
                  onApplyDials={handleApplyAIDials}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left columns dials & setups */}
                <div className="space-y-6">
                  <EditorWorkspace
                    activeLayout={activeLayout}
                    onLayoutChange={setActiveLayout}
                    frames={frames}
                    onUpdateFrame={handleUpdateFrame}
                    adjustments={adjustments}
                    onUpdateAdjustments={handleUpdateAdjustments}
                    onResetAdjustments={handleResetAdjustments}
                    selectedBackdropId={selectedBackdropId}
                    onSelectBackdrop={setSelectedBackdropId}
                    stripLabel={stripLabel}
                    onUpdateStripLabel={setStripLabel}
                    stripSubtitle={stripSubtitle}
                    onUpdateStripSubtitle={setStripSubtitle}
                    onTriggerAI={handleTriggerGementor}
                    aiLoading={aiLoading}
                    stickers={stickers}
                    onAddSticker={handleAddSticker}
                    frameColor={frameColor}
                    onFrameColorChange={setFrameColor}
                  />
                </div>

                {/* Right columns backdrops & print actions */}
                <div className="space-y-6 sticky top-0">
                  <EnhancementPanel
                    selectedBackdropId={selectedBackdropId}
                    onSelectBackdrop={setSelectedBackdropId}
                    onDownload={handleDownloadStrip}
                    onPrint={handlePrintStrip}
                    onShare={handleShareStrip}
                    onSaveToHistory={handleSaveToHistoryState}
                    isStagedForHistory={isStagedForHistory}
                    hasPhotos={hasPhotos}
                  />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUB ROUTE 2: Katalog Gaya & Vibes */}
        {currentView === 'vibes' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full py-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <button onClick={() => setCurrentView('editor')} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:text-white transition">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
                  Katalog Gaya & Vibes Booth
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pilih preset vibes populer dari internet dan lihat parameter filter, backdrop, dan border otomatis beradaptasi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {VISUAL_FILTERS.map((vib) => (
                <div key={vib.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between hover:border-zinc-700 hover:shadow-xl transition relative overflow-hidden">
                  <div className={`absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-tr ${vib.previewColor} opacity-15 blur-2xl`} />
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 block mb-1 uppercase">Preset Vibe</span>
                    <h3 className="font-display text-lg font-bold text-white mb-2">{vib.name}</h3>
                    <p className="text-xs text-zinc-400 leading-normal mb-1.5 font-bold italic text-indigo-300">"{vib.tagline}"</p>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-6">{vib.vibeDescription}</p>
                  </div>
                  
                  <button
                    onClick={() => handleApplyVibeFilter(vib)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-indigo-650 hover:text-white py-3 text-xs font-bold text-zinc-300 border border-zinc-800 hover:border-indigo-600 transition cursor-pointer"
                  >
                    Gunakan Gaya Ini <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB ROUTE 3: Riwayat Cetak (Persistent Saved strips gallery) */}
        {currentView === 'history' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full py-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentView('editor')} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:text-white transition">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="font-display text-2xl font-black text-white flex items-center gap-2">
                    Riwayat Cetak & Galeri Lokal
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Koleksi cetakan photo booth premium yang berhasil kamu simpan. Berkas tersimpan aman pada penyimpanan sandboxed lokal perangkat Anda.
                  </p>
                </div>
              </div>

              {historyList.length > 0 && (
                <button
                  onClick={() => { if(confirm("Hapus semua riwayat cetak?")) { saveToHistoryDb([]); } }}
                  className="rounded-xl border border-rose-950 bg-rose-950/20 px-4 py-2.5 text-xs font-bold text-rose-450 text-rose-400 hover:bg-rose-950 hover:text-white transition"
                >
                  Hapus Semua Galeri
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800 p-8">
                <History className="h-16 w-16 text-zinc-700 mb-4 animate-bounce" />
                <p className="font-bold text-white text-lg">Mulai Bersenang-senang!</p>
                <p className="text-sm max-w-sm mt-1">Kamu belum pernah menyimpan strip foto ke riwayat cetak. Buat desain, sesuaikan dengan AI, lalu klik "Simpan ke Galeri Riwayat" di Beranda!</p>
                <button
                  onClick={() => setCurrentView('editor')}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5  py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  Buka Booth Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {historyList.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3.5 flex flex-col justify-between group hover:border-zinc-700 transition relative overflow-hidden">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-900 bg-neutral-900 flex justify-center items-center">
                      <img src={item.image} className="h-full w-full object-contain select-none group-hover:scale-101 transition-transform" />
                      
                      {/* Hover download triggers */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-250 flex items-center justify-center gap-2 p-2">
                        <a 
                          href={item.image} 
                          download={`booth_gallery_${item.id}.png`}
                          className="rounded-full bg-indigo-650 p-2 text-white hover:bg-indigo-550 transition shadow-lg shadow-indigo-600/30"
                          title="Download PNG"
                        >
                          <FileDown className="h-4.5 w-4.5" />
                        </a>
                        <button 
                          onClick={() => handleClearHistoryItem(item.id)}
                          className="rounded-full bg-rose-650 p-2 text-white hover:bg-rose-550 transition shadow-lg"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3.5">
                      <h4 className="text-xs font-black text-white truncate">{item.layoutName}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-mono uppercase font-bold">
                        <Calendar className="h-3 w-3" /> {item.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB ROUTE 4: Pengaturan System */}
        {currentView === 'settings' && (
          <div className="space-y-6 max-w-2xl mx-auto w-full py-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <button onClick={() => setCurrentView('editor')} className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:text-white transition">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="font-display text-2xl font-black text-white">Pengaturan Booth & System</h2>
                <p className="text-xs text-zinc-400 mt-1">Konfigurasi sandboxing, status perangkat keras kamera, reset cache lokal, dan preferensi.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-6">
              {/* Camera access status card */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">Izin Kamera Perangkat</h3>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">Kamera Terintegrasi (Webcam API)</h4>
                      <p className="text-[10px] text-zinc-505 text-zinc-400 mt-0.5 leading-normal">Status browser: Mengizinkan requestFramePermissions ("camera")</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-3 py-1 border border-emerald-900/50 rounded-lg font-mono font-black uppercase">aktif</span>
                </div>
              </div>

              {/* API and server statuses */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-505 text-zinc-500">Teknologi Penyunting Kecerdasan Buatan</h3>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-850 pb-2.5">
                    <span className="text-zinc-400">Model Gemini AI:</span>
                    <b className="text-indigo-400 font-mono text-[11px] uppercase">gemini-3.5-flash (paid model flow ready)</b>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs border-b border-zinc-850 pb-2.5">
                    <span className="text-zinc-400">Server Handler:</span>
                    <b className="text-indigo-400 font-mono text-[11px] uppercase">Node.js Express Fullstack Container</b>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Penyimpanan Cache Gambar lokal:</span>
                    <b className="text-zinc-300 font-mono">{historyList.length} strip tersimpan</b>
                  </div>
                </div>
              </div>

              {/* Destructive actions */}
              <div className="pt-4 border-t border-zinc-900 flex justify-between gap-4">
                <button
                  onClick={() => { if(confirm("Reset semua setting filter dan tata letak tulisan kembali ke default?")) { handleResetAdjustments(); setStripLabel('SEOUL AI PHOTO STUDIO'); setStripSubtitle('MEMORIES IN FRAME'); setFrameColor('#ffffff'); setStickers([]); } }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-300 hover:bg-zinc-850 py-3 px-5 transition cursor-pointer"
                >
                  Reset Konfigurasi
                </button>

                <button
                  onClick={() => { if (confirm("Apakah Anda yakin ingin menghapus seluruh data strip foto dari galeri riwayat?")) { saveToHistoryDb([]); alert("Galeri berhasil dibersihkan."); } }}
                  className="rounded-xl border border-rose-955 border-rose-900 bg-rose-950/20 text-xs font-bold text-rose-450 text-rose-400 hover:bg-rose-950 hover:text-white py-3 px-5 transition cursor-pointer"
                >
                  Wipe Database Galeri
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
