"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiUpload, fileUrl } from "../lib/api";

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

const extOf = (name = "") => {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
};

/**
 * Zone d'upload de CV (drag & drop + parcourir).
 * onUploaded({ url, filename, originalName, size }) est appelé après succès.
 */
export default function FileUpload({
  onUploaded,
  onRemoved,
  value = null, // { url, originalName, size }
  label = "CV (PDF, DOC, DOCX — 5 Mo max)",
  hint = "Glissez-déposez votre fichier ici",
  endpoint = "/uploads/resume",
  className = "",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const validate = (file) => {
    if (!ALLOWED_EXT.includes(extOf(file.name))) {
      return "Format non autorisé. Formats acceptés : PDF, DOC, DOCX.";
    }
    if (file.size > MAX_SIZE) {
      return `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum 5 Mo.`;
    }
    return "";
  };

  const upload = async (file) => {
    const problem = validate(file);
    if (problem) {
      setError(problem);
      toast.error(problem);
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiUpload(endpoint, formData, {
        onProgress: (p) => setProgress(p),
      });
      onUploaded?.({
        url: data.url,
        filename: data.filename,
        originalName: data.originalName || file.name,
        size: data.size ?? file.size,
      });
      toast.success("CV téléversé avec succès");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) upload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setError("");
    onRemoved?.();
  };

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}

      {value?.url ? (
        <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 transition duration-200">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            {(extOf(value.originalName || value.url) || ".pdf").replace(".", "").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {value.originalName || "Mon CV"}
            </p>
            <p className="text-xs text-ink-muted">
              {value.size ? formatFileSize(value.size) : "Fichier joint"}
            </p>
          </div>
          <a
            href={fileUrl(value.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-2.5 py-1.5 text-xs"
          >
            Voir
          </a>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg p-2 text-neutral-400 transition duration-200 hover:bg-white hover:text-brand-600"
            aria-label="Retirer le fichier"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition duration-200 ${
            dragging
              ? "border-brand-500 bg-brand-50"
              : error
              ? "border-rose-300 bg-rose-50/40"
              : "border-neutral-300 bg-neutral-50 hover:border-brand-400 hover:bg-brand-50/50"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
            <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6H16a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v9" />
            </svg>
          </div>
          {uploading ? (
            <div className="mt-3 w-full max-w-xs">
              <p className="text-sm font-medium text-ink">Téléversement… {progress}%</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm font-semibold text-ink">{hint}</p>
              <p className="mt-1 text-xs text-ink-muted">PDF, DOC ou DOCX — 5 Mo maximum</p>
              <span className="btn-outline mt-3 px-4 py-2 text-xs">Parcourir mes fichiers</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
