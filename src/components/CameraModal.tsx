import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertCircle, X, Check, Timer, Zap } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotosCaptured: (images: string[]) => void;
  frameCountNeeded: number;
}

export default function CameraModal({ isOpen, onClose, onPhotosCaptured, frameCountNeeded }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturingSession, setIsCapturingSession] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [soundEffect, setSoundEffect] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setCapturedImages([]);
    setActiveFrameIndex(0);
    setIsCapturingSession(false);
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(
        "Kamera tidak dapat diakses. Mohon izinkan izin kamera perangkat " +
        "atau pastikan kamera tidak sedang digunakan aplikasi lain. " +
        "Jika Anda berada di dalam iframe, coba buka di Tab Baru."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Play a simple procedural audio beep for retro photo-booth feel
  const playBeep = (freq: number, duration: number) => {
    if (!soundEffect) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = freq;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignored if browser blocking audio thread
    }
  };

  const captureSingleFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw frame mirrored for easy natural feedback
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0); // reset matrix

      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      
      // Trigger camera flash visual animation
      setFlashActive(true);
      playBeep(880, 0.25);
      setTimeout(() => setFlashActive(false), 200);

      return base64;
    }
    return null;
  };

  // Automated 4-photo continuous strip taking session
  const startSessionCapture = async () => {
    if (isCapturingSession) return;
    setIsCapturingSession(true);
    setCapturedImages([]);
    
    for (let i = 0; i < frameCountNeeded; i++) {
      setActiveFrameIndex(i);
      
      // Count down sequence
      for (let count = 3; count > 0; count--) {
        setCountdown(count);
        playBeep(440, 0.1);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
      const photo = captureSingleFrame();
      if (photo) {
        setCapturedImages(prev => {
          const updated = [...prev, photo];
          return updated;
        });
      }
      
      // Buffer space between photos to change pose
      if (i < frameCountNeeded - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    setIsCapturingSession(false);
  };

  const handleManualCapture = () => {
    const photo = captureSingleFrame();
    if (photo) {
      setCapturedImages(prev => {
        const updated = [...prev];
        updated[activeFrameIndex] = photo;
        return updated;
      });
      // Move pointer forward
      if (activeFrameIndex < frameCountNeeded - 1) {
        setActiveFrameIndex(activeFrameIndex + 1);
      }
    }
  };

  const saveSelectedImages = () => {
    onPhotosCaptured(capturedImages);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="camera_modal_root" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      {/* Invisible canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      <div id="camera_modal" className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-805 bg-zinc-950 shadow-2xl md:flex-row">
        
        {/* Flash visual overlay */}
        {flashActive && (
          <div className="absolute inset-0 z-50 animate-fade-out bg-white opacity-95 transition-opacity pointer-events-none" />
        )}

        {/* Dynamic Countdown Text overlay over camera view */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <span className="scale-animate text-9xl font-extrabold text-white font-display drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {/* Video stream container */}
        <div className="relative flex-1 bg-neutral-900 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <AlertCircle id="camera_error_icon" className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
              <p className="font-semibold text-lg text-white mb-2">Akses Kamera Gagal</p>
              <p className="text-sm max-w-md">{error}</p>
              <button 
                id="camera_retry_btn"
                onClick={startCamera}
                className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-650 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-600 transition"
              >
                <RefreshCw className="h-4 w-4" /> Coba Hubungkan Kembali
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover scale-x-[-1]"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-emerald-400 font-mono flex items-center gap-1.5 backdrop-blur-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Dihubungkan: 1080P Live Feed
              </div>

              {/* Crop guide target frame */}
              <div className="absolute inset-0 pointer-events-none border-[32px] border-black/40 flex items-center justify-center">
                <div className="h-[90%] w-[80%] border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 border-t-2 border-l-2 border-white absolute top-10 left-10" />
                  <div className="h-4 w-4 border-t-2 border-r-2 border-white absolute top-10 right-10" />
                  <div className="h-4 w-4 border-b-2 border-l-2 border-white absolute bottom-10 left-10" />
                  <div className="h-4 w-4 border-b-2 border-r-2 border-white absolute bottom-10 right-10" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Dashboard / Capture List Controls */}
        <div className="w-full md:w-80 border-t md:border-l md:border-t-0 border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
                <Camera className="h-5 w-5 text-indigo-400" />
                Ambil Pose Terbaikmu!
              </h3>
              <button id="close_camera_modal_btn" onClick={onClose} className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-5 leading-normal">
              Butuh <b className="text-indigo-300">{frameCountNeeded} foto</b> untuk layout pilihanmu. Ambil pose secara manual satu-satu atau mulai kluster otomatis bergaya studio!
            </p>

            {/* Quick captured strip previews */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 flex justify-between">
                <span>Daftar Foto Booth</span>
                <span>{capturedImages.filter(Boolean).length} / {frameCountNeeded} Terisi</span>
              </div>
              <div className="grid grid-cols-4 gap-2 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                {Array.from({ length: frameCountNeeded }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => !isCapturingSession && setActiveFrameIndex(idx)}
                    disabled={isCapturingSession}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-850 border transition ${
                      activeFrameIndex === idx 
                        ? 'border-indigo-400 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10' 
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {capturedImages[idx] ? (
                      <img src={capturedImages[idx]} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500 font-display">
                        {idx + 1}
                      </div>
                    )}
                    
                    {capturedImages[idx] && (
                      <div className="absolute bottom-1 right-1 rounded-full bg-indigo-600 p-0.5 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls panel */}
            <div className="space-y-3">
              <button
                id="camera_auto_session_btn"
                onClick={startSessionCapture}
                disabled={isCapturingSession || !!error}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition ${
                  isCapturingSession 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <Timer className="h-4.5 w-4.5 animate-spin-slow" />
                {isCapturingSession ? 'Sesi AI Berjalan...' : 'Mulai Sesi Otomatis (4s)'}
              </button>

              <button
                id="camera_manual_snap_btn"
                onClick={handleManualCapture}
                disabled={isCapturingSession || !!error}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-850 transition"
              >
                <Camera className="h-4.5 w-4.5" /> Ambil Foto ke-{activeFrameIndex + 1}
              </button>

              {/* Sound Effect toggle */}
              <div className="flex items-center justify-between pointer-events-auto pt-2.5 px-1.5 border-t border-zinc-900">
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> Efek Suara Studio
                </span>
                <button
                  onClick={() => setSoundEffect(!soundEffect)}
                  className={`relative inline-flex h-5.5 w-9.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    soundEffect ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      soundEffect ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-900 pt-4 space-y-2">
            <button
              id="camera_save_btn"
              onClick={saveSelectedImages}
              disabled={capturedImages.filter(Boolean).length < frameCountNeeded}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-xl transition ${
                capturedImages.filter(Boolean).length < frameCountNeeded
                  ? 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              Simpan Hasil Foto
            </button>
            <p className="text-[10px] text-center text-zinc-500">
              *Pastikan semua slot foto terisi untuk hasil layout foto terbaik.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
