// main.js (versión pública — usa fetchScores en vez de supabase client)
import { fetchScores } from './api.js'; // ajusta la ruta si lo pusiste en utils/api.js

// Mapeo de nombres de jugadores a los IDs de las tarjetas HTML
const jugadoresMapeo = {
  "IngratoConcubino": "player1",
  "Takabrawn": "player2",
  "Ovejacaracol": "player3",
  "Arquimax": "player4"
};

// =================================================================
// PASO 1: CREAR LA FUNCIÓN PARA RESETEAR LAS TARJETAS
// =================================================================
function resetearTarjetas() {
  for (const tarjetaId of Object.values(jugadoresMapeo)) {
    const tarjeta = document.getElementById(tarjetaId);
    if (tarjeta) {
      tarjeta.classList.add('inactive');
      document.getElementById(`${tarjetaId}-puntuacion`).textContent = `Puntuación: 0`;
      document.getElementById(`${tarjetaId}-eliminaciones`).textContent = `Eliminaciones: 0`;
      document.getElementById(`${tarjetaId}-bajas`).textContent = `Bajas: 0`;
      document.getElementById(`${tarjetaId}-asistencias`).textContent = `Asistencias: 0`;
      document.getElementById(`${tarjetaId}-muertes`).textContent = `Muertes: 0`;
      document.getElementById(`${tarjetaId}-daño`).textContent = `Daño: 0`;
    }
  }
}

// =================================================================
// Función que carga scores usando fetchScores (ya filtrado en el server)
// =================================================================
async function cargarScores(rango = '5h') {
  resetearTarjetas();
  const totalesJugadores = {};

  // llamamos al endpoint que devuelve ya las filas (sin .gte ni .order en cliente)
  try {
    const data = await fetchScores(rango); // data es array de objetos rows

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No hay datos devueltos por fetchScores');
      return;
    }

    // Procesa los registros igual que antes:
    data.forEach(partida => {
      const nombre = partida.nombre;
      if (!totalesJugadores[nombre]) {
        totalesJugadores[nombre] = {
          puntuacion: 0,
          eliminaciones: 0,
          bajas: 0,
          asistencias: 0,
          muertes: 0,
          daño: 0
        };
      }
      totalesJugadores[nombre].puntuacion += partida.puntuacion || 0;
      totalesJugadores[nombre].eliminaciones += partida.eliminaciones || 0;
      totalesJugadores[nombre].bajas += partida.bajas || 0;
      totalesJugadores[nombre].asistencias += partida.asistencias || 0;
      totalesJugadores[nombre].muertes += partida.muertes || 0;
      totalesJugadores[nombre].daño += partida.daño || 0;
    });

    // Actualiza sólo las tarjetas con datos
    for (const nombreJugador in totalesJugadores) {
      const tarjetaId = jugadoresMapeo[nombreJugador];
      if (tarjetaId) {
        const tarjeta = document.getElementById(tarjetaId);
        const datosTotales = totalesJugadores[nombreJugador];
        tarjeta.classList.remove('inactive');
        document.getElementById(`${tarjetaId}-puntuacion`).textContent = `Puntuación: ${datosTotales.puntuacion}`;
        document.getElementById(`${tarjetaId}-eliminaciones`).textContent = `Eliminaciones: ${datosTotales.eliminaciones}`;
        document.getElementById(`${tarjetaId}-bajas`).textContent = `Bajas: ${datosTotales.bajas}`;
        document.getElementById(`${tarjetaId}-asistencias`).textContent = `Asistencias: ${datosTotales.asistencias}`;
        document.getElementById(`${tarjetaId}-muertes`).textContent = `Muertes: ${datosTotales.muertes}`;
        document.getElementById(`${tarjetaId}-daño`).textContent = `Daño: ${datosTotales.daño}`;
      }
    }
  } catch (err) {
    console.error('Error al cargar scores desde fetchScores:', err);
  }
}

// Manejo de eventos para los botones de filtro
document.getElementById('btn-5h').addEventListener('click', () => cargarScores('5h'));
document.getElementById('btn-7d').addEventListener('click', () => cargarScores('7d'));
document.getElementById('btn-30d').addEventListener('click', () => cargarScores('30d'));

// Por defecto carga últimas 5h al abrir la página
// Espera que el DOM esté listo si tu main.js se carga en el <head> o antes del body.
// Si lo incluyes justo antes del </body>, puedes llamar directo:
document.addEventListener('DOMContentLoaded', () => {
  cargarScores('5h');
});


// 1. Obtener todos los botones
const botones = document.querySelectorAll('.efecto_boton');

// 2. Iterar sobre ellos y añadir un "escuchador" de clic
botones.forEach(boton => {
  boton.addEventListener('click', function() {
    
    // a) Primero, quitar la clase 'activo' de CUALQUIER botón que la tenga
    botones.forEach(b => {
      b.classList.remove('activo');
    });
    
    // b) Luego, añadir la clase 'activo' SOLO al botón que se ha clicado
    this.classList.add('activo');
  });
});