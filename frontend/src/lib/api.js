export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Racine du serveur (sans le suffixe /api) — utile pour les fichiers statiques /uploads/...
export const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

// Construit l'URL absolue d'un fichier servi par le backend
export function fileUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${SERVER_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("opportunify_token");
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("opportunify_token", token);
  else localStorage.removeItem("opportunify_token");
}

export async function apiFetch(path, { method = "GET", body, token, headers = {} } = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const finalToken = token ?? getStoredToken();
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (finalToken) finalHeaders.Authorization = `Bearer ${finalToken}`;

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }
  if (!res.ok) {
    const message = data?.message || data?.errors?.[0]?.msg || `Erreur ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Upload multipart/form-data : on ne fixe PAS Content-Type,
 * le navigateur ajoute lui-même la boundary.
 */
export async function apiUpload(path, formData, { method = "POST", token, onProgress } = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const finalToken = token ?? getStoredToken();

  // XMLHttpRequest pour bénéficier de la progression d'upload
  if (typeof onProgress === "function" && typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      if (finalToken) xhr.setRequestHeader("Authorization", `Bearer ${finalToken}`);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) onProgress(Math.round((evt.loaded / evt.total) * 100));
      };
      xhr.onload = () => {
        let data = null;
        if (xhr.responseText) {
          try { data = JSON.parse(xhr.responseText); } catch { data = { message: xhr.responseText }; }
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve(data);
        } else {
          const err = new Error(data?.message || data?.errors?.[0]?.msg || `Erreur ${xhr.status}`);
          err.status = xhr.status;
          err.data = data;
          reject(err);
        }
      };
      xhr.onerror = () => reject(new Error("Impossible de joindre le serveur"));
      xhr.send(formData);
    });
  }

  const headers = {};
  if (finalToken) headers.Authorization = `Bearer ${finalToken}`;
  const res = await fetch(url, { method, headers, body: formData });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.errors?.[0]?.msg || `Erreur ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => apiFetch(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiFetch(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiFetch(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => apiFetch(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => apiFetch(path, { ...opts, method: "DELETE" }),
  upload: (path, formData, opts) => apiUpload(path, formData, opts),
};
