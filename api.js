// api.js
// Función simple que llama a tu endpoint (Vercel o local) y devuelve los datos.
// Cambia API_BASE según donde estés probando:
// - para pruebas local: 'http://localhost:3000/api'
// - para Vercel: 'https://tu-proyecto.vercel.app/api'

const API_BASE = 'https://mi-proyecto.vercel.app/api'; // <- CAMBIA AQUI

export async function fetchScores(rango = '5h') {
  const url = `${API_BASE}/scores?rango=${encodeURIComponent(rango)}`;
  const res = await fetch(url, { method: 'GET', mode: 'cors' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error fetching scores: ${res.status} ${res.statusText} ${text}`);
  }
  const payload = await res.json();
  // asumimos payload.data es el array de filas (como devuelve el endpoint sugerido)
  return payload.data || [];
}
