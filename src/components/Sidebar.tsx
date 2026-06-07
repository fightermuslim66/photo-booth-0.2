import { Upload, Camera, Sparkles, LayoutGrid, Heart, History, Settings, Info, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  onUploadClick: () => void;
  onCameraClick: () => void;
  onNavigate: (view: 'editor' | 'vibes' | 'history' | 'settings') => void;
  currentView: string;
  historyCount: number;
}

export default function Sidebar({ onUploadClick, onCameraClick, onNavigate, currentView, historyCount }: SidebarProps) {
  
  const aiFeatures = [
    {
      title: "AI Background",
      desc: "Ubah background otomatis dengan banyak pilihan",
      icon: <LayoutGrid className="h-4.5 w-4.5 text-indigo-400" />
    },
    {
      title: "AI Outfit",
      desc: "Ganti pakaian sesuai gaya yang kamu mau",
      icon: <Sparkles className="h-4.5 w-4.5 text-pink-400" />
    },
    {
      title: "AI Enhance",
      desc: "Tingkatkan kualitas foto jadi lebih tajam & jernih",
      icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
    },
    {
      title: "AI Face Retouch",
      desc: "Perbaiki wajah secara natural, tetap kamu banget",
      icon: <Heart className="h-4.5 w-4.5 text-orange-400" />
    },
    {
      title: "AI Lighting",
      desc: "Atur pencahayaan studio otomatis dengan AI",
      icon: <Sparkles className="h-4.5 w-4.5 text-amber-400" />
    }
  ];

  return (
    <div id="app_sidebar" className="flex h-full w-full flex-col justify-between overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-5 text-white md:w-80">
      
      {/* Branding Header Block */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-pink-600 to-amber-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl font-black tracking-tight text-white flex items-center gap-1">
              PhotoBooth <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Interactive Studio v2.6</p>
          </div>
        </div>

        {/* Feature Hero Card */}
        <div className="rounded-2xl bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-900/30 p-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-16 w-16 bg-pink-500/10 rounded-full blur-xl" />
          <h2 className="font-display text-sm font-extrabold text-white leading-snug">
            Ubah Foto Biasa Jadi <br />
            <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Photo Booth Keren</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Dengan AI, kamu bisa dapatkan hasil studio premium secara instan dalam sekali klik ✨
          </p>

          {/* Graphical Mockup Strip */}
          <div className="mt-4 grid grid-cols-2 gap-3 items-center bg-black/40 p-2.5 rounded-xl border border-zinc-850">
            <div className="flex flex-col items-center justify-center aspect-[3/4] bg-zinc-800 text-center p-2 rounded-lg relative overflow-hidden border border-zinc-700">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase">Input</span>
              <div className="mt-2 h-14 w-11 rounded-md bg-zinc-700 flex items-center justify-center text-lg">👩</div>
              <span className="text-[8px] text-zinc-400 font-sans mt-1">Biasa</span>
            </div>
            
            <div className="h-full flex flex-col justify-between items-center py-0.5 bg-neutral-900 border border-indigo-900/40 rounded-lg scale-105 shadow-md shadow-indigo-500/15">
              <div className="text-[8px] font-semibold text-indigo-400 scale-75 font-display flex items-center gap-0.5">
                <Sparkles className="h-2 w-2" /> PHOTO AI
              </div>
              <div className="grid grid-cols-2 gap-0.5 p-1 w-full scale-95">
                <div className="aspect-square rounded-sm bg-indigo-950/60 flex items-center justify-center text-xs border border-indigo-900/20">🌸</div>
                <div className="aspect-square rounded-sm bg-indigo-950/60 flex items-center justify-center text-xs border border-indigo-900/20">✨</div>
                <div className="aspect-square rounded-sm bg-indigo-950/60 flex items-center justify-center text-xs border border-indigo-900/20">👩‍🎨</div>
                <div className="aspect-square rounded-sm bg-indigo-950/60 flex items-center justify-center text-xs border border-indigo-900/20">📸</div>
              </div>
              <div className="text-[6px] text-zinc-500 scale-75 font-mono">2026.06.05</div>
            </div>
          </div>
        </div>

        {/* Action Direct Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            id="sidebar_upload_btn"
            onClick={onUploadClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-505 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-500 transition-all duration-200"
          >
            <Upload className="h-4.5 w-4.5" /> Upload Foto Galeri
          </button>

          <button
            id="sidebar_camera_btn"
            onClick={onCameraClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-850 hover:text-white transition"
          >
            <Camera className="h-4.5 w-4.5 text-pink-400" /> Ambil Foto Kamera
          </button>
        </div>

        {/* Interactive Checkbox AI features list */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">Fitur AI Booth</h3>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {aiFeatures.map((feat, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl bg-zinc-900/45 p-2.5 border border-zinc-900 hover:border-zinc-800 transition">
                <div className="flex shrink-0 h-6 w-6 items-center justify-center rounded-lg bg-zinc-950 mt-0.5 border border-zinc-800">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">{feat.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-6 border-t border-zinc-900 pt-4 space-y-1">
        <button
          onClick={() => onNavigate('editor')}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
            currentView === 'editor' 
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-inner' 
              : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
          }`}
        >
          <LayoutGrid className="h-4.5 w-4.5 text-indigo-400" /> Beranda Booth
        </button>

        <button
          onClick={() => onNavigate('vibes')}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
            currentView === 'vibes' 
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-inner' 
              : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
          }`}
        >
          <Sparkles className="h-4.5 w-4.5 text-pink-400 font-semibold" /> Katalog Gaya & Vibes
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
            currentView === 'history' 
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-inner' 
              : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-3">
            <History className="h-4.5 w-4.5 text-emerald-400" /> Riwayat Cetak
          </span>
          {historyCount > 0 && (
            <span className="rounded-full bg-indigo-900/80 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
            currentView === 'settings' 
              ? 'bg-zinc-900 text-white border border-zinc-800 shadow-inner' 
              : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
          }`}
        >
          <Settings className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" /> Pengaturan System
        </button>

        <div className="flex items-center gap-1.5 justify-center py-2 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
          <Info className="h-3 w-3" /> didukung oleh gemini AI
        </div>
      </div>

    </div>
  );
}
