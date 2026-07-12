export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const descargarArchivo = async (path, nombreSugerido) => {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('No se pudo descargar el archivo.');

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const nombreArchivo = match?.[1] || nombreSugerido || 'archivo';

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
