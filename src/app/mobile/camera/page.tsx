"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMobileToken, clearMobileToken } from "@/lib/mobileWebAuth";
import { ArrowLeft, MapPin, RotateCcw, Upload } from "lucide-react";

type GpsStatus = "loading" | "ok" | "denied" | "unavailable";

interface Gps {
  lat: number | null;
  lng: number | null;
  status: GpsStatus;
}

function CameraView() {
  const router = useRouter();
  const params = useSearchParams();
  const siteId = params.get("siteId") ?? "";
  const campaignId = params.get("campaignId") ?? "";
  const siteCode = params.get("siteCode") ?? "Capture Photo";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [captured, setCaptured] = useState<string | null>(null);
  const [gps, setGps] = useState<Gps>({ lat: null, lng: null, status: "loading" });
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Please allow camera permission in your browser settings.");
    }
  }, []);

  useEffect(() => {
    if (!getMobileToken()) { router.replace("/mobile"); return; }

    startCamera();

    // GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, status: "ok" }),
        () => setGps({ lat: null, lng: null, status: "denied" }),
        { timeout: 12000, enableHighAccuracy: true }
      );
    } else {
      setGps({ lat: null, lng: null, status: "unavailable" });
    }

    return () => stopCamera();
  }, [router, startCamera, stopCamera]);

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
  }

  function retake() {
    setCaptured(null);
    setError("");
    startCamera();
  }

  async function upload() {
    if (!captured) return;
    setUploading(true);
    setError("");
    try {
      const token = getMobileToken();
      const res = await fetch(captured);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, `photo_${Date.now()}.jpg`);
      formData.append("siteId", siteId);
      formData.append("campaignId", campaignId);
      if (gps.lat != null) formData.append("lat", String(gps.lat));
      if (gps.lng != null) formData.append("lng", String(gps.lng));

      const uploadRes = await fetch("/api/mobile/photos", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (uploadRes.status === 401) {
        clearMobileToken();
        router.push("/mobile");
        return;
      }
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }

      setUploadDone(true);
      setTimeout(() => router.push(`/mobile/sites/${siteId}`), 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const gpsLabel =
    gps.status === "loading" ? "Getting GPS…" :
    gps.status === "ok" ? `${gps.lat!.toFixed(5)}, ${gps.lng!.toFixed(5)}` :
    "GPS unavailable";

  const gpsColor = gps.status === "ok" ? "#4ade80" : "#f87171";

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 pt-12 pb-6 bg-gradient-to-b from-black/70 to-transparent">
        <button
          onClick={() => { stopCamera(); router.back(); }}
          className="p-2 rounded-full bg-black/30 active:bg-black/50"
        >
          <ArrowLeft size={20} color="#fff" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{decodeURIComponent(siteCode)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} color={gpsColor} />
            <span className="text-xs truncate" style={{ color: gpsColor }}>{gpsLabel}</span>
          </div>
        </div>
      </div>

      {/* Camera / Preview */}
      <div className="flex-1 flex items-center justify-center bg-black">
        {cameraError ? (
          <div className="px-6 text-center">
            <p className="text-red-400 text-sm">{cameraError}</p>
            <button onClick={startCamera} className="mt-4 text-white text-sm underline">Try again</button>
          </div>
        ) : !captured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ minHeight: "100vh", maxHeight: "100vh" }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={captured}
            alt="captured"
            className="w-full object-contain"
            style={{ maxHeight: "100vh" }}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-14 pt-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-5">
        {error && (
          <div className="bg-red-900/80 text-red-100 text-xs px-4 py-2.5 rounded-xl text-center w-full max-w-xs">
            {error}
          </div>
        )}

        {uploadDone ? (
          <div className="text-white font-semibold text-center text-lg">
            ✓ Uploaded successfully!
          </div>
        ) : !captured ? (
          /* Capture button */
          <button
            onClick={capturePhoto}
            disabled={!!cameraError}
            className="w-18 h-18 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 shadow-lg"
            style={{ width: 72, height: 72 }}
          >
            <div className="w-14 h-14 rounded-full bg-[#e63946]" />
          </button>
        ) : (
          /* Retake / Upload */
          <div className="flex items-center gap-10 justify-center">
            <button onClick={retake} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30">
                <RotateCcw size={22} color="#fff" />
              </div>
              <span className="text-white text-xs">Retake</span>
            </button>

            <button
              onClick={upload}
              disabled={uploading}
              className="flex flex-col items-center gap-2 disabled:opacity-60"
            >
              <div className="w-16 h-16 rounded-full bg-[#e63946] flex items-center justify-center active:bg-red-700 shadow-lg">
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={22} color="#fff" />
                )}
              </div>
              <span className="text-white text-xs">{uploading ? "Uploading…" : "Upload"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileCameraPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CameraView />
    </Suspense>
  );
}
