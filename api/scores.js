// api/scores.js  (Vercel serverless)
import { createClient } from '@supabase/supabase-js';

// --- Configuración de CORS dinámica ---
const allowedOrigins = ['https://arquitav.github.io']; // Producción

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://127.0.0.1:5500'); // Live Server
  allowedOrigins.push('http://localhost:5500');   // Alternativa
}

export default async function handler(req, res) {
  // Elegir el origen que se permite según el request
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { autoRefreshToken: false } });

    const rango = req.query.rango || '5h';
    let fechaInicio = new Date(0);
    const ahora = new Date();
    if (rango === '5h') fechaInicio = new Date(ahora - 5 * 60 * 60 * 1000);
    else if (rango === '7d') fechaInicio = new Date(ahora - 7 * 24 * 60 * 60 * 1000);
    else if (rango === '30d') fechaInicio = new Date(ahora - 30 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .gte('hora_partida', fechaInicio.toISOString())
      .order('partida_id', { ascending: true });

    if (error) throw error;

    // cachea en CDN para reducir invocaciones
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('Error en /api/scores:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
