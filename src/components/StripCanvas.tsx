import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Download, Printer, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { LayoutPreset, PhotoFrameState, AdjustmentSettings, StickerState, STUDIO_BACKDROPS } from '../types';

interface StripCanvasProps {
  layout: LayoutPreset;
  frames: PhotoFrameState[];
  adjustments: AdjustmentSettings;
  stickers: StickerState[];
  frameColor: string; // solid HEX background
  stripLabel: string;
  stripSubtitle: string;
  selectedBackdropId: string | null;
  onRemoveSticker: (id: string) => void;
  onUpdateStickerPos: (id: string, x: number, y: number) => void;
}

export interface StripCanvasRef {
  exportToImage: () => Promise<string>;
}

const StripCanvas = forwardRef<StripCanvasRef, StripCanvasProps>(({
  layout,
  frames,
  adjustments,
  stickers,
  frameColor,
  stripLabel,
  stripSubtitle,
  selectedBackdropId,
  onRemoveSticker,
  onUpdateStickerPos
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // Retrieve the background css value
  const activeBackdrop = STUDIO_BACKDROPS.find(b => b.id === selectedBackdropId);
  const backgroundStyleValue = activeBackdrop ? activeBackdrop.value : '#1e1e1e';
  const isBackdropGradient = activeBackdrop?.isGradient;

  // Compile active CSS filters for the frames based on current adjustments & standard filter
  const getFilterCSSString = (frame個別FilterId?: string) => {
    // Compile adjustments: contrast, brightness, saturation, blur, vignette, sepia
    const brightness = 1 + adjustments.brightness / 100;
    const contrast = 1 + adjustments.contrast / 100;
    const saturation = 1 + adjustments.saturation / 100;
    const blurSetting = adjustments.blur;
    const sepiaVal = adjustments.sepia / 100;

    let filterStr = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${sepiaVal})`;
    if (blurSetting > 0) {
      filterStr += ` blur(${blurSetting * 0.4}px)`;
    }
    return filterStr;
  };

  // Implement handle for export
  useImperativeHandle(ref, () => ({
    exportToImage: async () => {
      // Create high-res canvas based on active layout standard size
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Gagal menginisialisasi canvas ekspor.");

      // Choose high-res dimensions
      let width = 800;
      let height = 1200;

      if (layout.id === 'vertical_strip') {
        width = 500;
        height = 1600;
      } else if (layout.id === 'grid_2x2') {
        width = 1000;
        height = 1000;
      } else if (layout.id === 'horizontal_strip') {
        width = 1500;
        height = 550;
      } else if (layout.id === 'portrait_studio') {
        width = 800;
        height = 1200;
      }

      canvas.width = width;
      canvas.height = height;

      // 1. Draw solid frame color or background border
      ctx.fillStyle = frameColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle film border lines
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, width - 10, height - 10);

      // 2. Process layouts
      const d = layout;
      const marginPercent = 0.05; // 5% border spacing
      const padX = width * marginPercent;
      const padY = height * (d.id === 'vertical_strip' ? 0.03 : 0.05);
      const isVertical = d.id === 'vertical_strip';
      const isHorizontal = d.id === 'horizontal_strip';

      // Define grid geometry
      let workspaceW = width - padX * 2;
      let workspaceH = height - padY * 2;

      // Footer allowance
      let footerH = 0;
      if (isVertical) {
        footerH = height * 0.12; // generous strip ribbon bottom
        workspaceH -= footerH;
      } else if (isHorizontal) {
        footerH = height * 0.15;
        workspaceH -= footerH;
      } else if (d.id === 'portrait_studio') {
        footerH = height * 0.10;
        workspaceH -= footerH;
      } else if (d.id === 'grid_2x2') {
        footerH = height * 0.12;
        workspaceH -= footerH;
      }

      const totalGapX = (d.cols - 1) * (width * 0.02);
      const totalGapY = (d.rows - 1) * (height * 0.02);

      const cellW = (workspaceW - totalGapX) / d.cols;
      const cellH = (workspaceH - totalGapY) / d.rows;

      // Draw each frame
      for (let r = 0; r < d.rows; r++) {
        for (let c1 = 0; c1 < d.cols; c1++) {
          const frameIdx = r * d.cols + c1;
          const frame = frames[frameIdx];
          if (!frame) continue;

          const dx = padX + c1 * (cellW + (width * 0.02));
          const dy = padY + r * (cellH + (height * 0.02));

          // A. Draw individual photo background (backdrop selected)
          ctx.save();
          // Clip to image slot box with soft rounded edges
          const roundedRadius = width * 0.015;
          ctx.beginPath();
          ctx.moveTo(dx + roundedRadius, dy);
          ctx.lineTo(dx + cellW - roundedRadius, dy);
          ctx.quadraticCurveTo(dx + cellW, dy, dx + cellW, dy + roundedRadius);
          ctx.lineTo(dx + cellW, dy + cellH - roundedRadius);
          ctx.quadraticCurveTo(dx + cellW, dy + cellH, dx + cellW - roundedRadius, dy + cellH);
          ctx.lineTo(dx + roundedRadius, dy + cellH);
          ctx.quadraticCurveTo(dx, dy + cellH, dx, dy + cellH - roundedRadius);
          ctx.lineTo(dx, dy + roundedRadius);
          ctx.quadraticCurveTo(dx, dy, dx + roundedRadius, dy);
          ctx.closePath();
          ctx.clip();

          // Fill photo background backdrop
          if (isBackdropGradient && backgroundStyleValue.includes('gradient')) {
            const gradient = ctx.createLinearGradient(dx, dy, dx + cellW, dy + cellH);
            if (selectedBackdropId === 'backdrop_studio_white') {
              gradient.addColorStop(0, '#f5f7fa');
              gradient.addColorStop(1, '#c3cfe2');
            } else if (selectedBackdropId === 'backdrop_studio_beige') {
              gradient.addColorStop(0, '#fdfbf7');
              gradient.addColorStop(1, '#e2d1c3');
            } else if (selectedBackdropId === 'backdrop_studio_blue') {
              gradient.addColorStop(0, '#1e3c72');
              gradient.addColorStop(1, '#2a5298');
            } else if (selectedBackdropId === 'backdrop_aesthetic_arch') {
              gradient.addColorStop(0, '#eaddca');
              gradient.addColorStop(1, '#d5bdaf');
            } else {
              gradient.addColorStop(0, '#ffd3e1');
              gradient.addColorStop(1, '#bbf7d0');
            }
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = backgroundStyleValue.startsWith('#') ? backgroundStyleValue : '#dedede';
          }
          ctx.fillRect(dx, dy, cellW, cellH);

          // B. Draw image if exists
          if (frame.image) {
            const img = new Image();
            img.src = frame.image;
            await new Promise((res) => { img.onload = res; });

            ctx.save();
            // Apply filtering directly on the canvas buffer (brightness/contrast/saturation)
            const brightness = 1 + adjustments.brightness / 100;
            const contrast = 1 + adjustments.contrast / 100;
            const saturation = 1 + adjustments.saturation / 100;
            const sepiaVal = adjustments.sepia / 100;
            
            // Set canvas filter
            ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${sepiaVal}) grayscale(${adjustments.sepia > 50 ? 0.3 : 0})`;

            // Draw image scaled and centered
            const imgRatio = img.width / img.height;
            const cellRatio = cellW / cellH;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            let tx = dx, ty = dy, tw = cellW, th = cellH;

            if (imgRatio > cellRatio) {
              // Image is wider, slice sides
              sw = img.height * cellRatio;
              sx = (img.width - sw) / 2;
            } else {
              // Image is taller, slice top bottom
              sh = img.width / cellRatio;
              sy = (img.height - sh) / 2;
            }

            // Support mirroring
            if (frame.mirrored) {
              ctx.translate(dx + cellW / 2, dy + cellH / 2);
              ctx.scale(-1, 1);
              ctx.drawImage(img, sx, sy, sw, sh, -cellW / 2, -cellH / 2, tw, th);
            } else {
              ctx.drawImage(img, sx, sy, sw, sh, tx, ty, tw, th);
            }

            ctx.restore(); // restore mapping for filters
          } else {
            // Draw dummy placeholder with camera emojis
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(dx, dy, cellW, cellH);
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillText("📷", dx + cellW / 2, dy + cellH / 2);
          }

          // C. Simulated Outfit / Accessories layering inside canvas
          if (frame.outfitId) {
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let emoji = '🧥';
            if (frame.outfitId === 'outfit_knit') emoji = '🧶';
            if (frame.outfitId === 'outfit_leather') emoji = '⚡';
            if (frame.outfitId === 'outfit_hanbok') emoji = '🌸';
            if (frame.outfitId === 'accessory_cool_shades') emoji = '🕶️';
            if (frame.outfitId === 'accessory_cat_ears') emoji = '🐱';
            if (frame.outfitId === 'accessory_crown') emoji = '👑';
            if (frame.outfitId === 'accessory_party') emoji = '👓';

            // Draw emoji centrally over photo booth face
            ctx.fillText(emoji, dx + cellW / 2, dy + cellH * 0.72);
          }

          // D. Apply vignette/shading soft-circle filter
          if (adjustments.vignette > 0) {
            const vignetteRad = Math.sqrt((cellW / 2) ** 2 + (cellH / 2) ** 2);
            const grad = ctx.createRadialGradient(
              dx + cellW / 2, dy + cellH / 2, vignetteRad * 0.4,
              dx + cellW / 2, dy + cellH / 2, vignetteRad
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 100 * 0.55})`);
            ctx.fillStyle = grad;
            ctx.fillRect(dx, dy, cellW, cellH);
          }

          // Draw inner outline shading box
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 2;
          ctx.strokeRect(dx, dy, cellW, cellH);

          ctx.restore(); // restore clipping mask
        }
      }

      // Left vertical watermark banner
      ctx.save();
      ctx.translate(width * 0.022, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `bold ${width * 0.011}px "JetBrains Mono", Courier, monospace`;
      ctx.fillStyle = (frameColor && frameColor.toLowerCase() === '#ffffff') ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.28)';
      ctx.textAlign = 'center';
      ctx.fillText("BOTCAHBANGILAN01 // ORIGINAL STUDIO FRAME", 0, 0);
      ctx.restore();

      // Right vertical watermark banner
      ctx.save();
      ctx.translate(width * 0.978, height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.font = `bold ${width * 0.011}px "JetBrains Mono", Courier, monospace`;
      ctx.fillStyle = (frameColor && frameColor.toLowerCase() === '#ffffff') ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.28)';
      ctx.textAlign = 'center';
      ctx.fillText("BOTCAHBANGILAN01 // ORIGINAL STUDIO FRAME", 0, 0);
      ctx.restore();

      // 3. Draw Brand strip labels inside footer area
      ctx.save();
      const bottomY = height - footerH;
      ctx.fillStyle = (frameColor && frameColor.toLowerCase() === '#ffffff') ? '#1a1a1a' : '#ffffff';
      if (frameColor && frameColor.toLowerCase() !== '#ffffff') {
        // High contrast footer
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#111111';
      }

      ctx.textAlign = 'center';
      
      // Top Label
      ctx.font = `bold ${width * 0.032}px "Outfit", Arial`;
      ctx.fillText(stripLabel.toUpperCase(), width / 2, height - footerH / 2 - (width * 0.015));
      
      // Subtitle with decorative stars
      ctx.font = `bold ${width * 0.018}px "JetBrains Mono", Courier`;
      ctx.fillStyle = 'rgba(120,120,120,0.85)';
      ctx.fillText(`✨ ${stripSubtitle.toUpperCase()} ✨`, width / 2, height - footerH / 2 + (width * 0.015));

      // Small tiny footer date/timestamp metadata with permanent botcahbangilan01 watermark
      ctx.font = `bold ${width * 0.013}px "JetBrains Mono", Courier, monospace`;
      ctx.fillStyle = (frameColor && frameColor.toLowerCase() === '#ffffff') ? 'rgba(26, 26, 26, 0.55)' : 'rgba(240, 240, 240, 0.55)';
      const dStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
      ctx.fillText(`🔒 PROTECTED BY BOTCAHBANGILAN01 // STUDIO REF ${dStamp}`, width / 2, height - (width * 0.02));

      ctx.restore();

      // 4. Render active stickers overlays
      for (const stick of stickers) {
        ctx.save();
        const sx1 = (stick.xPercent / 100) * width;
        const sy1 = (stick.yPercent / 100) * height;

        // Draw an ultra-cute badge stamp background
        ctx.translate(sx1, sy1);
        ctx.font = `bold ${width * 0.022}px Arial`;
        const textMetrics = ctx.measureText(stick.text.toUpperCase());
        const textW = textMetrics.width + 16;
        const textH = width * 0.045;

        // Draw cute speech bubbles or badges
        ctx.fillStyle = stick.colorStyle === 'pink' ? '#ffd3e1' : 
                        stick.colorStyle === 'blue' ? '#bfdbfe' :
                        stick.colorStyle === 'yellow' ? '#fef08a' :
                        stick.colorStyle === 'green' ? '#bbf7d0' : '#e9d5ff';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.roundRect(-textW / 2, -textH / 2, textW, textH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#111111';
        ctx.font = `extrabold ${width * 0.020}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stick.text.toUpperCase(), 0, 0);

        ctx.restore();
      }

      // Draw grain filter effect on exported output for vintage quality
      if (adjustments.grain > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = adjustments.grain / 100 * 0.28;
        for (let i = 0; i < width; i += 150) {
          for (let j = 0; j < height; j += 150) {
            // Draw tiny randomized noise flecks
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(i + Math.random() * 150, j + Math.random() * 150, 2, 2);
          }
        }
        ctx.restore();
      }

      // Return Base64 PNG
      return canvas.toDataURL('image/png');
    }
  }));

  // Handle Drag-and-drop / Touch-dragging of stickers on layout preview
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    // Calculate relative percentage coordinates
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain percentages
    const clampedX = Math.max(5, Math.min(x, 95));
    const clampedY = Math.max(5, Math.min(y, 95));

    onUpdateStickerPos(id, clampedX, clampedY);
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, id: string) => {
    const touch = e.touches[0];
    touchStartRef.current = { id, x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(x, 95));
    const clampedY = Math.max(5, Math.min(y, 95));

    onUpdateStickerPos(touchStartRef.current.id, clampedX, clampedY);
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Compile CSS dimensions based on preset
  let previewAspect = 'aspect-[3/4]';
  if (layout.id === 'vertical_strip') previewAspect = 'aspect-[1/3.2] max-w-[280px]';
  if (layout.id === 'grid_2x2') previewAspect = 'aspect-square max-w-[420px]';
  if (layout.id === 'portrait_studio') previewAspect = 'aspect-[2/3] max-w-[360px]';
  if (layout.id === 'horizontal_strip') previewAspect = 'aspect-[16/7] max-w-[650px]';

  return (
    <div className="flex flex-col items-center">
      
      {/* Decorative Container */}
      <div 
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        id="live_photostrip_container"
        className={`relative ${previewAspect} w-full shadow-2xl transition-all duration-300 pointer-events-auto select-none overflow-hidden rounded-xl grain-overlay`}
        style={{
          backgroundColor: frameColor || '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255,255,255,0.05)',
          padding: layout.id === 'vertical_strip' ? '12px 10px 45px 10px' : '20px'
        }}
      >
        {/* Left side subtle vertical watermark */}
        <div 
          className="absolute left-[3px] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[5.5px] opacity-25 tracking-[0.2em] font-mono font-black uppercase select-none pointer-events-none whitespace-nowrap"
          style={{
            color: (frameColor && frameColor.toLowerCase() === '#ffffff') ? '#000000' : '#ffffff',
          }}
        >
          botcahbangilan01
        </div>

        {/* Right side subtle vertical watermark */}
        <div 
          className="absolute right-[3px] top-1/2 -translate-y-1/2 rotate-90 origin-center text-[5.5px] opacity-25 tracking-[0.2em] font-mono font-black uppercase select-none pointer-events-none whitespace-nowrap"
          style={{
            color: (frameColor && frameColor.toLowerCase() === '#ffffff') ? '#000000' : '#ffffff',
          }}
        >
          botcahbangilan01
        </div>

        {/* Strip Grid Content */}
        <div 
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
            gap: layout.id === 'vertical_strip' ? '8px' : '12px',
            // Allow bottom allowance for ribbon in Grid and Single configurations
            height: layout.id === 'vertical_strip' ? '88%' : '84%'
          }}
        >
          {Array.from({ length: layout.frameCount }).map((_, idx) => {
            const frame = frames[idx];
            if (!frame) return null;

            return (
              <div
                key={idx}
                className="relative h-full w-full overflow-hidden rounded-lg border border-white/5 bg-zinc-900/60 shadow-inner flex items-center justify-center group"
                style={{
                  background: isBackdropGradient && backgroundStyleValue.includes('gradient') ? backgroundStyleValue : '#1a1a1a',
                  backgroundColor: !isBackdropGradient ? backgroundStyleValue : undefined
                }}
              >
                {/* Photo Renders with CSS visual filters applied */}
                {frame.image ? (
                  <img
                    src={frame.image}
                    alt={`Frame ${idx + 1}`}
                    className={`h-full w-full object-cover select-none transition ${frame.mirrored ? 'scale-x-[-1]' : ''}`}
                    style={{
                      filter: getFilterCSSString(frame.filterId),
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-xl animate-bounce">📷</span>
                    <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase mt-1">Slot {idx + 1}</span>
                  </div>
                )}

                {/* Simulated Outfit Overlay */}
                {frame.image && frame.outfitId && (
                  <div 
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 select-none pointer-events-none transform scale-120 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] text-3xl font-display"
                  >
                    {VIRTUAL_OUTFIT_EMOJIS[frame.outfitId] || '🧥'}
                  </div>
                )}

                {/* Soft Vignette Overlay effect */}
                {adjustments.vignette > 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition"
                    style={{
                      background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${adjustments.vignette / 100 * 0.55}) 100%)`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Ribbon Footer */}
        <div 
          className="absolute bottom-0 left-0 right-0 py-2 px-3 flex flex-col justify-center items-center text-center space-y-0.5"
          style={{
            color: (frameColor && frameColor.toLowerCase() === '#ffffff') ? '#1a1a1a' : '#ffffff'
          }}
        >
          <div className="font-display font-extrabold text-[10px] tracking-widest uppercase truncate max-w-[90%] leading-tight">
            {stripLabel || "INTERACTIVE PHOTO BOOTH"}
          </div>
          <div className="font-mono text-[7px] scale-90 opacity-75 tracking-wider uppercase font-medium">
            ✨ {stripSubtitle || "AI STUDIO SHOT"} ✨
          </div>
          <div className="font-mono text-[6.5px] tracking-widest opacity-45 uppercase font-bold mt-0.5">
            🔒 Protected by botcahbangilan01
          </div>
        </div>

        {/* Draggable Stickers overlay */}
        {stickers.map((stick) => (
          <div
            key={stick.id}
            draggable
            onDragStart={(e) => handleDragStart(e, stick.id)}
            onTouchStart={(e) => handleTouchStart(e, stick.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`absolute z-30 cursor-grab transform -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 border-2 border-zinc-950 px-2.5 py-0.5 rounded-lg shadow-md select-none group pointer-events-auto hover:scale-105 active:cursor-grabbing hover:border-indigo-500 active:rotate-2 transition-transform duration-150 ${
              stick.colorStyle === 'pink' ? 'bg-pink-100 text-pink-800' : 
              stick.colorStyle === 'blue' ? 'bg-blue-100 text-blue-800' :
              stick.colorStyle === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              stick.colorStyle === 'green' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
            }`}
            style={{
              left: `${stick.xPercent}%`,
              top: `${stick.yPercent}%`,
            }}
          >
            <span className="font-display text-[9px] font-black uppercase tracking-wider">{stick.text}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemoveSticker(stick.id); }}
              className="ml-1 opacity-20 hover:opacity-100 text-black rounded-full h-3.5 w-3.5 flex items-center justify-center text-[8px] bg-black/10 transition"
            >
              ×
            </button>
          </div>
        ))}

      </div>

      <p className="text-[10px] text-zinc-500 font-mono tracking-wide mt-3 text-center flex items-center gap-1.5 bg-zinc-900/40 px-3 py-1.5 rounded-full border border-zinc-900">
        <Sparkles className="h-3 w-3 text-amber-500" />
        Geser & tempatkan stiker langsung pada gambar preview di atas!
      </p>

    </div>
  );
});

// Emoji lookups for outfits overlay simulation
const VIRTUAL_OUTFIT_EMOJIS: Record<string, string> = {
  'outfit_blazer': '🧥',
  'outfit_knit': '🧶',
  'outfit_leather': '⚡',
  'outfit_hanbok': '🌸',
  'accessory_cool_shades': '🕶️',
  'accessory_cat_ears': '🐱',
  'accessory_crown': '👑',
  'accessory_party': '👓'
};

export default StripCanvas;
