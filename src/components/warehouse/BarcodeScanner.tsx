"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

type BarcodeScannerProps = {
  onDetected: (value: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let stopped = false;

    async function start() {
      try {
        if (!("mediaDevices" in navigator) || !navigator.mediaDevices?.getUserMedia) {
          throw new Error("Kamera nije dostupna u ovom pregledaču.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const BarcodeDetectorCtor = (window as Window & {
          BarcodeDetector?: new (options?: { formats?: string[] }) => {
            detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
          };
        }).BarcodeDetector;

        if (!BarcodeDetectorCtor) {
          setError("Automatsko očitavanje nije podržano. Unesite barkod ručno.");
          return;
        }

        const detector = new BarcodeDetectorCtor({
          formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"],
        });

        const scan = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            const value = results.find((result) => result.rawValue)?.rawValue;
            if (value) {
              stopped = true;
              onDetected(value);
              return;
            }
          } catch {
            // Kamera može privremeno izgubiti kadar; nastavljamo skeniranje.
          }
          if (!stopped) window.setTimeout(scan, 250);
        };

        void scan();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nije moguće otvoriti kameru.");
      }
    }

    void start();

    return () => {
      stopped = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 p-3 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <div className="text-sm font-black text-slate-900">Skeniraj barkod</div>
            <div className="text-[11px] text-slate-500">Usmeri kameru ka barkodu proizvoda.</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Zatvori skener">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative aspect-[4/3] bg-slate-950">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-2xl border-2 border-cyan-400 shadow-[0_0_0_999px_rgba(15,23,42,.35)]" />
          <Camera className="absolute bottom-4 left-1/2 h-6 w-6 -translate-x-1/2 text-white" />
        </div>
        {error && <p className="px-4 py-3 text-xs font-semibold text-amber-700">{error}</p>}
        <button type="button" onClick={onClose} className="m-4 min-h-11 w-[calc(100%-2rem)] rounded-xl border border-slate-200 text-sm font-black text-slate-700">
          Unesi barkod ručno
        </button>
      </div>
    </div>
  );
}
