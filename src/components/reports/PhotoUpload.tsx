"use client";

import { useState, useRef } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  campaignId: string;
  siteId: string;
  monitorId?: string;
  onUploaded: () => void;
}

interface Preview { file: File; url: string }

export default function PhotoUpload({ campaignId, siteId, monitorId, onUploaded }: Props) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPreviews = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removePreview = (idx: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[idx].url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < previews.length; i++) {
      const fd = new FormData();
      fd.append("file", previews[i].file);
      fd.append("campaignId", campaignId);
      fd.append("siteId", siteId);
      if (monitorId) fd.append("monitorId", monitorId);

      await fetch("/api/upload", { method: "POST", body: fd });
      setProgress(Math.round(((i + 1) / previews.length) * 100));
    }

    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setUploading(false);
    setProgress(0);
    onUploaded();
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <div
        className="flex flex-col items-center justify-center gap-2 py-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <ImagePlus size={28} className="text-gray-400" />
        <p className="text-sm text-gray-500">Click or drag photos here to upload</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {previews.map((p, i) => (
              <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          {uploading ? (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-[#e63946] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-500 text-center">Uploading… {progress}%</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{previews.length} photo{previews.length !== 1 ? "s" : ""} selected</span>
              <Button size="sm" onClick={handleUpload}>
                <Upload size={12} />
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
