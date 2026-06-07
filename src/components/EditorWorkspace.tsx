import { useState } from 'react';
import { Sliders, Sparkles, Image, RefreshCw, Type, Palette, Layout, Trash2, ArrowRightLeft, Smile, HelpCircle, Layers } from 'lucide-react';
import { 
  LayoutPreset, LAYOUT_PRESETS, 
  VisualFilter, VISUAL_FILTERS, 
  StudioBackdrop, STUDIO_BACKDROPS,
  VisualOutfit, VIRTUAL_OUTFITS,
  PhotoFrameState, AdjustmentSettings, 
  StickerState, DEFAULT_ADJUSTMENTS 
} from '../types';

interface EditorWorkspaceProps {
  activeLayout: LayoutPreset;
  onLayoutChange: (preset: LayoutPreset) => void;
  frames: PhotoFrameState[];
  onUpdateFrame: (idx: number, updates: Partial<PhotoFrameState>) => void;
  adjustments: AdjustmentSettings;
  onUpdateAdjustments: (updates: Partial<AdjustmentSettings>) => void;
  onResetAdjustments: () => void;
  selectedBackdropId: string | null;
  onSelectBackdrop: (id: string | null) => void;
  
  stripLabel: string;
  onUpdateStripLabel: (val: string) => void;
  stripSubtitle: string;
  onUpdateStripSubtitle: (val: string) => void;
  
  onTriggerAI: (userPrompt: string, styleMode: string) => void;
  aiLoading: boolean;

  stickers: StickerState[];
  onAddSticker: (text: string, color: string) => void;

  frameColor: string;
  onFrameColorChange: (val: string) => void;
}

export default function EditorWorkspace({
  activeLayout,
  onLayoutChange,
  frames,
  onUpdateFrame,
  adjustments,
  onUpdateAdjustments,
  onResetAdjustments,
  selectedBackdropId,
  onSelectBackdrop,
  stripLabel,
  onUpdateStripLabel,
  stripSubtitle,
  onUpdateStripSubtitle,
  onTriggerAI,
  aiLoading,
  onAddSticker,
  frameColor,
  onFrameColorChange
}: EditorWorkspaceProps) {
  const [activeFrameTab, setActiveFrameTab] = useState<number>(0);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiSelectedStyle, setAiSelectedStyle] = useState<string>('enhance');
  const [newStickerText, setNewStickerText] = useState<string>('');
  const [newStickerColor, setNewStickerColor] = useState<string>('pink');

  const presetFrameColors = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Dark Slate', hex: '#111111' },
    { name: 'Candy Pink', hex: '#ffd3e1' },
    { name: 'Beige Aesthetic', hex: '#fdfbf7' },
    { name: 'Retro Cream', hex: '#faf0d7' },
    { name: 'Pale Lilac', hex: '#e8dbfc' },
    { name: 'Mint Green', hex: '#e2f9e1' },
    { name: 'Sky Blue', hex: '#dff3fd' }
  ];

  const handleTriggerAICommand = () => {
    onTriggerAI(aiCustomPrompt, aiSelectedStyle);
  };

  const handleCreateStickerLocal = () => {
    if (!newStickerText.trim()) return;
    onAddSticker(newStickerText, newStickerColor);
    setNewStickerText('');
  };

  const activeFrame = frames[activeFrameTab] || null;

  return (
    <div id="editor_workspace_controls" className="space-y-6">
      
      {/* 1. Layout Preset Selection Blocks */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="font-display text-sm font-extrabold text-white mb-3.5 flex items-center gap-1.5">
          <Layout className="h-4.5 w-4.5 text-indigo-400" />
          Pilih Format Layout Strip
        </h3>
        
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {LAYOUT_PRESETS.map((preset) => {
            const isSelected = activeLayout.id === preset.id;
            return (
              <button
                key={preset.id}
                id={`layout_preset_${preset.id}`}
                onClick={() => onLayoutChange(preset)}
                className={`relative flex flex-col p-3 rounded-xl border transition text-left cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-650/5' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                <div className="text-xs font-bold text-white leading-tight">{preset.name}</div>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 leading-normal capitalize">
                  {preset.cols}×{preset.rows} slots ({preset.aspectRatio})
                </span>
                {isSelected && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Photo Slots Manager & Specific Frame Accessories */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="font-display text-sm font-extrabold text-white mb-3.5 flex items-center gap-1.5">
          <Layers className="h-4.5 w-4.5 text-indigo-400" />
          Kustomisasi Slot Foto & Pakaian AI
        </h3>

        {/* Tab Header Selector */}
        <div className="flex border-b border-zinc-900 gap-1 mb-4 overflow-x-auto pb-1">
          {Array.from({ length: activeLayout.frameCount }).map((_, idx) => (
            <button
              key={idx}
              id={`frame_tab_${idx}`}
              onClick={() => setActiveFrameTab(idx)}
              className={`px-4.5 py-2 text-xs font-semibold rounded-t-lg transition shrink-0 ${
                activeFrameTab === idx 
                  ? 'bg-zinc-900 text-white border-t border-x border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Foto Slot {idx + 1} {frames[idx]?.image ? '✔️' : '⭕'}
            </button>
          ))}
        </div>

        {/* Selected Frame Specific Controls Panel */}
        {activeFrame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-zinc-90 w-full rounded-xl bg-zinc-900/40 p-4 border border-zinc-900">
            {/* Quick action buttons for selected photo frame */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-zinc-500">Edit Foto Slot {activeFrameTab + 1}</span>
                {activeFrame.image && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-400 font-mono border border-emerald-900/50">
                    Selesai Dimuat
                  </span>
                )}
              </div>

              {!activeFrame.image ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl bg-zinc-950 border border-dashed border-zinc-800 text-center p-4">
                  <Image id="slot_placeholder_img" className="h-8 w-8 text-zinc-600 mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">Foto kosong untuk slot ini.</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-xs leading-normal">
                    Klik "Upload" di sidebar atau ambil foto instan menggunakan kamera di atas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      id={`mirror_btn_${activeFrameTab}`}
                      onClick={() => onUpdateFrame(activeFrameTab, { mirrored: !activeFrame.mirrored })}
                      className="flex-1 flex gap-2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 py-2.5 transition"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Mirror Horisontal
                    </button>
                    
                    <button
                      id={`delete_slot_btn_${activeFrameTab}`}
                      onClick={() => onUpdateFrame(activeFrameTab, { image: null, rawImage: null, outfitId: null })}
                      className="flex gap-2 items-center justify-center rounded-xl border border-rose-950 bg-rose-950/20 text-rose-400 hover:bg-rose-950/80 hover:text-white py-2.5 px-4 text-xs font-semibold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-normal">
                    *Gaya yang disunting seperti mirror dan pakaian virtual (outfit) hanya akan diaplikasikan khusus bagi Slot {activeFrameTab + 1}.
                  </p>
                </div>
              )}
            </div>

            {/* Virtual Studio Outfits Selectors */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-zinc-500">Pakaian & Aksesoris Virtual (Gaya AI)</span>
              
              <div className="grid grid-cols-4 gap-2">
                <button
                  id={`outfit_none_${activeFrameTab}`}
                  onClick={() => onUpdateFrame(activeFrameTab, { outfitId: null })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border aspect-square cursor-pointer transition ${
                    activeFrame.outfitId === null
                      ? 'border-indigo-500 bg-indigo-950/20 text-white' 
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm">❌</span>
                  <span className="text-[8px] font-bold font-mono tracking-wide mt-1 uppercase text-center truncate w-full">Polos</span>
                </button>

                {VIRTUAL_OUTFITS.map((outfit) => {
                  const isSelected = activeFrame.outfitId === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      id={`outfit_${outfit.id}_${activeFrameTab}`}
                      onClick={() => activeFrame.image && onUpdateFrame(activeFrameTab, { outfitId: outfit.id })}
                      disabled={!activeFrame.image}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border aspect-square cursor-pointer transition ${
                        !activeFrame.image ? 'opacity-35 cursor-not-allowed' : ''
                      } ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-900/30 text-white' 
                          : 'border-zinc-850 bg-zinc-950 text-zinc-300 hover:border-zinc-750'
                      }`}
                      title={outfit.description}
                    >
                      <span className="text-lg">{outfit.emoji}</span>
                      <span className="text-[8px] font-display font-bold mt-1 text-center truncate w-full leading-snug">
                        {outfit.name.replace("Premium ", "").replace("Tradisional ", "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. Studio Dials / Precision adjustment sliders */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-1.5">
            <Sliders className="h-4.5 w-4.5 text-indigo-400" />
            Parameter Penyesuaian Foto Booth
          </h3>
          
          <button
            id="reset_adjustments_btn"
            onClick={onResetAdjustments}
            className="text-[10px] font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-2.5 py-1 rounded-md border border-zinc-800 transition cursor-pointer"
          >
            Reset Setting
          </button>
        </div>

        {/* Sliders loop */}
        <div className="space-y-4">
          {/* Brightness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium font-sans">Kecerahan (Brightness)</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.brightness > 0 ? "+" : ""}{adjustments.brightness}%</span>
            </div>
            <input
              id="slider_brightness"
              type="range"
              min="-40"
              max="40"
              value={adjustments.brightness}
              onChange={(e) => onUpdateAdjustments({ brightness: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Kontras (Contrast)</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.contrast > 0 ? "+" : ""}{adjustments.contrast}%</span>
            </div>
            <input
              id="slider_contrast"
              type="range"
              min="-40"
              max="40"
              value={adjustments.contrast}
              onChange={(e) => onUpdateAdjustments({ contrast: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Saturasi Warna</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.saturation > 0 ? "+" : ""}{adjustments.saturation}%</span>
            </div>
            <input
              id="slider_saturation"
              type="range"
              min="-40"
              max="40"
              value={adjustments.saturation}
              onChange={(e) => onUpdateAdjustments({ saturation: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Soft Bloom blur */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Soft Glow (Dreamy Blur)</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.blur}px</span>
            </div>
            <input
              id="slider_blur"
              type="range"
              min="0"
              max="8"
              value={adjustments.blur}
              onChange={(e) => onUpdateAdjustments({ blur: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Vignette */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Vignette Bayangan Sisi</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.vignette}%</span>
            </div>
            <input
              id="slider_vignette"
              type="range"
              min="0"
              max="70"
              value={adjustments.vignette}
              onChange={(e) => onUpdateAdjustments({ vignette: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Sepia tone */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Rona Warm (Sepia Retro)</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.sepia}%</span>
            </div>
            <input
              id="slider_sepia"
              type="range"
              min="0"
              max="100"
              value={adjustments.sepia}
              onChange={(e) => onUpdateAdjustments({ sepia: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Vintage grain */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 font-medium">Film Grain Noise</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold">{adjustments.grain}%</span>
            </div>
            <input
              id="slider_grain"
              type="range"
              min="0"
              max="60"
              value={adjustments.grain}
              onChange={(e) => onUpdateAdjustments({ grain: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Frame solid color customization & Label Ribbons */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="font-display text-sm font-extrabold text-white mb-3.5 flex items-center gap-1.5">
          <Palette className="h-4.5 w-4.5 text-indigo-400" />
          Kustomisasi Warna Frame & Label Kertas
        </h3>

        <div className="space-y-4">
          {/* Color list circles */}
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-2">Pilihan Warna Frame Kertas</span>
            <div className="flex flex-wrap gap-2.5">
              {presetFrameColors.map((color, i) => {
                const isSelected = frameColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={i}
                    onClick={() => onFrameColorChange(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`h-7 w-7 rounded-full border cursor-pointer transition ${
                      isSelected 
                        ? 'scale-115 ring-2 ring-indigo-500/80 border-indigo-500' 
                        : 'border-zinc-850 hover:scale-105'
                    }`}
                    title={color.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Ribbon label inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-indigo-400" /> Header Label Ribbon
              </label>
              <input
                id="input_strip_label"
                type="text"
                value={stripLabel}
                onChange={(e) => onUpdateStripLabel(e.target.value)}
                placeholder="PRO STUDIO PHOTO // 2026"
                className="w-full rounded-xl border border-zinc-830 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-indigo-400" /> Subtitle Ribbon
              </label>
              <input
                id="input_strip_subtitle"
                type="text"
                value={stripSubtitle}
                onChange={(e) => onUpdateStripSubtitle(e.target.value)}
                placeholder="AI EXPERT SHOT STYLED"
                className="w-full rounded-xl border border-zinc-830 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Custom stickers and badging builder */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <h3 className="font-display text-sm font-extrabold text-white mb-3 flex items-center gap-1.5">
          <Smile className="h-4.5 w-4.5 text-indigo-400" />
          Kustomisasi Stiker Cetak
        </h3>
        
        <p className="text-xs text-zinc-400 leading-normal mb-4">
          Tulis kata-kata seru (e.g., "OOTD", "KEREN", "BESTIE") untuk dipajang sebagai stiker lucu yang bisa digeser sesukamu!
        </p>

        <div className="flex gap-2.5">
          <input
            id="input_new_sticker"
            type="text"
            maxLength={10}
            value={newStickerText}
            onChange={(e) => setNewStickerText(e.target.value)}
            placeholder="KATA STIKER..."
            className="flex-1 rounded-xl border border-zinc-830 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
          />

          <select
            id="select_sticker_color"
            value={newStickerColor}
            onChange={(e) => setNewStickerColor(e.target.value)}
            className="rounded-xl border border-zinc-830 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="pink">Pink Cute</option>
            <option value="blue">Blue Light</option>
            <option value="yellow">Yellow Pop</option>
            <option value="green">Mint Garden</option>
            <option value="violet">Lilac Cosy</option>
          </select>

          <button
            id="add_sticker_btn"
            onClick={handleCreateStickerLocal}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-white border border-zinc-750 transition"
          >
            Sematkan
          </button>
        </div>
      </div>

      {/* 6. AI Studio Directives Engine ("Buat dengan AI") */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-tr from-zinc-950 via-zinc-950 to-indigo-950/20 p-5 shadow-lg">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-400 rotate-12" />
          </div>
          <div>
            <h3 className="font-display text-sm font-extrabold text-white">Buat Kreasi AI Estetik</h3>
            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400">Gemini Professional Photographer Engine</span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Unggah setidaknya satu foto, lalu pilih gaya arahan dan ketik perintah tambahan. Gemini akan secara otomatis menganalisis posemu dan memprogram kustomisasi filter, pencahayaan, sticker stamp, serta judul ribbon secara natural!
        </p>

        <div className="space-y-4">
          {/* Style suggestions selection drops */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Pilih Garis Besar Gaya / Vibes</label>
            <select
              id="select_ai_style"
              value={aiSelectedStyle}
              onChange={(e) => setAiSelectedStyle(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
            >
              <option value="enhance">AI Professional Portrait Optimizer (Default)</option>
              <option value="korea_id">K-Pop Drama Lead // Korean Studio Card</option>
              <option value="cyberpunk">Tokyo Cyberpunk Neon Retro Vibe</option>
              <option value="vintage_mood">90s Golden Hour Nostalgic Editorial</option>
              <option value="minimal_cozy">Aesthetic Sand Beige Cozy Minimalist</option>
            </select>
          </div>

          {/* Custom instructions and prompt text */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Instruksi Tambahan untuk AI (Opsional)</label>
            <textarea
              id="textarea_ai_prompt"
              rows={2}
              value={aiCustomPrompt}
              onChange={(e) => setAiCustomPrompt(e.target.value)}
              placeholder="Contoh: 'Terapkan gaya retro bernuansa hangat dan tambahkan stiker lucu bertema cinta...'"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder-zinc-550 focus:border-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          <button
            id="trigger_ai_btn"
            onClick={handleTriggerAICommand}
            disabled={aiLoading}
            className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-extrabold text-white shadow-xl transition-all ${
              aiLoading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-810'
                : 'bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-500 shadow-indigo-650/15 hover:scale-[1.01] hover:brightness-105 cursor-pointer'
            }`}
          >
            {aiLoading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Menganalisis Foto Anda...
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-amber-200 animate-pulse" /> Buat Foto Berkelas dengan Gemini AI
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
