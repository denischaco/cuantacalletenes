import { useState, useEffect } from 'react';

/**
 * Servicio de Presencia y Heartbeat con Redis Sorted Sets
 */

// 1. Generar o recuperar ID único por pestaña (sessionStorage)
export function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  let sessionId = sessionStorage.getItem('player_session_id');
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('player_session_id', sessionId);
  }
  return sessionId;
}

let currentOnlineCount = null;
const listeners = new Set();
let heartbeatInterval = null;

export function subscribeOnlineCount(callback) {
  listeners.add(callback);
  if (currentOnlineCount !== null) {
    callback(currentOnlineCount);
  }
  return () => {
    listeners.delete(callback);
  };
}

// 2. Función para avisar que el jugador sigue activo y obtener el total
export async function sendHeartbeat() {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();

  try {
    const res = await fetch('/api/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });

    if (!res.ok) return;
    const data = await res.json();

    if (typeof data.online === 'number') {
      currentOnlineCount = data.online;
      listeners.forEach((fn) => {
        try {
          fn(data.online);
        } catch {}
      });

      // Actualizar el DOM si existe el badge
      const badge = document.getElementById('online-badge');
      if (badge) {
        badge.innerText = `🟢 ${data.online} jugando ahora`;
      }
    }
  } catch (err) {
    console.warn('No se pudo enviar el heartbeat:', err);
  }
}

// 3. Optimización: Pings con pausa por pestaña inactiva
export function startHeartbeat() {
  if (heartbeatInterval || typeof window === 'undefined') return;
  sendHeartbeat(); // Envío inmediato al volver
  heartbeatInterval = setInterval(sendHeartbeat, 45000); // 45s de margen con timeout de 90s en backend
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Escuchar cambios de foco de pestaña (Page Visibility API)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHeartbeat(); // Suspende pings si minimiza o cambia de pestaña
    } else {
      startHeartbeat();
    }
  });

  // Arrancar al cargar el script en el navegador
  startHeartbeat();
}

/**
 * Hook para componentes React
 */
export function useOnlineCount() {
  const [online, setOnline] = useState(currentOnlineCount);

  useEffect(() => {
    return subscribeOnlineCount((count) => {
      setOnline(count);
    });
  }, []);

  return online;
}
