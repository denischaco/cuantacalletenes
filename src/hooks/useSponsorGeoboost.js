import { useState, useEffect, useCallback, useRef } from 'react';
import sponsorsData from '../data/sponsors.json';
import { getLoadedSponsors } from '../utils/streetRandomizer';
import { findNearbySponsor, findClosestSponsor, GEO_BASE_THRESHOLD_METERS } from '../utils/geoUtils';
import { trackEvent } from '../services/analytics';

// Umbral base: 130 metros (~1 cuadra completa de Resistencia, Chaco)
const GEO_THRESHOLD_METERS = GEO_BASE_THRESHOLD_METERS || 130;

/**
 * Helper para detectar si hay un bypass QA activo vía query param (?geoboost=fichita | ?geoboost=bacanal)
 */
function getQaBypassSponsor() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const qaParam = params.get('geoboost') || params.get('boost');
    if (!qaParam) return null;

    const normalized = qaParam.toLowerCase().trim();
    const sponsors = getLoadedSponsors();
    const sponsor =
      sponsors.find(
        (s) =>
          s.id.toLowerCase() === normalized ||
          s.name.toLowerCase().includes(normalized) ||
          s.shortName?.toLowerCase().includes(normalized)
      ) || sponsors.find((s) => s.active);

    return sponsor || null;
  } catch {
    return null;
  }
}

export function useSponsorGeoboost() {
  // Inicialización directa si hay QA bypass
  const [activeBoost, setActiveBoost] = useState(() => {
    const qaSponsor = getQaBypassSponsor();
    if (qaSponsor) {
      return {
        sponsor: qaSponsor,
        distanceMeters: 10,
        isMock: true
      };
    }
    return null;
  });

  const [nearestSponsorInfo, setNearestSponsorInfo] = useState(null); // { sponsor, distanceMeters }
  
  const [geoStatus, setGeoStatus] = useState(() => {
    const qaSponsor = getQaBypassSponsor();
    return qaSponsor ? 'active' : 'idle';
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handlePositionSuccess = useCallback((position, isFallback = false) => {
    if (!isMountedRef.current) return;
    const { latitude, longitude, accuracy } = position.coords;
    const sponsors = getLoadedSponsors();
    const match = findNearbySponsor(latitude, longitude, sponsors, GEO_THRESHOLD_METERS, accuracy);

    if (match) {
      setActiveBoost({
        sponsor: match.sponsor,
        distanceMeters: match.distanceMeters,
        isMock: false
      });
      setNearestSponsorInfo({
        sponsor: match.sponsor,
        distanceMeters: match.distanceMeters,
        tier: 'EnElLugar'
      });
      setGeoStatus('active');
      trackEvent('geoboost_detected', {
        sponsor_id: match.sponsor.id,
        sponsor_name: match.sponsor.name,
        distance_meters: match.distanceMeters,
        accuracy_meters: Math.round(accuracy || 0),
        is_fallback_network: isFallback
      });
    } else {
      const closest = findClosestSponsor(latitude, longitude, sponsors);
      setActiveBoost(null);
      setNearestSponsorInfo(closest);
      setGeoStatus('out_of_range');
    }
  }, []);

  const handlePositionError = useCallback((error) => {
    if (!isMountedRef.current) return;
    console.warn('[GeoBoost] Error de geolocalización:', error.code, error.message);
    setActiveBoost(null);

    // Clasificación precisa de error
    if (error.code === 1) {
      // PERMISSION_DENIED
      setGeoStatus('denied');
    } else if (error.code === 2) {
      // POSITION_UNAVAILABLE
      setGeoStatus('unavailable');
    } else if (error.code === 3) {
      // TIMEOUT
      setGeoStatus('timeout');
    } else {
      setGeoStatus('unavailable');
    }
  }, []);

  const checkProximity = useCallback((forceFresh = true) => {
    // 1. Verificar primero si existe bypass QA en URL
    const qaSponsor = getQaBypassSponsor();
    if (qaSponsor) {
      console.info(`[GeoBoost QA Bypass] Activado manualmente/en URL para: ${qaSponsor.name}`);
      setActiveBoost({
        sponsor: qaSponsor,
        distanceMeters: 10,
        isMock: true
      });
      setNearestSponsorInfo({
        sponsor: qaSponsor,
        distanceMeters: 10,
        tier: 'EnElLugar'
      });
      setGeoStatus('active');
      trackEvent('geoboost_detected', {
        sponsor_id: qaSponsor.id,
        sponsor_name: qaSponsor.name,
        distance_meters: 10,
        accuracy_meters: 5,
        qa_bypass: true
      });
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }

    setGeoStatus('checking');

    // Invalidar caché cuando es forzado o click de reintento
    const isFresh = forceFresh === true || (typeof forceFresh === 'object' && forceFresh !== null);
    const maximumAge = isFresh ? 0 : 30000;

    // Intento 1: Alta precisión GPS (15s)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePositionSuccess(position, false);
      },
      (firstError) => {
        // Si el usuario denegó permiso explícitamente (código 1), no reintentar
        if (firstError.code === 1) {
          handlePositionError(firstError);
          return;
        }

        // Intento 2 (Fallback): Si hubo TIMEOUT o señal no disponible en interiores,
        // reintentar inmediatamente con triangulación Wi-Fi/celda (enableHighAccuracy: false)
        console.info('[GeoBoost] GPS de alta precisión no disponible o demorado. Probando fallback Wi-Fi/Red celular...');

        navigator.geolocation.getCurrentPosition(
          (fallbackPosition) => {
            handlePositionSuccess(fallbackPosition, true);
          },
          (secondError) => {
            // Si ambos fallaron, reportar el error final
            handlePositionError(secondError || firstError);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 segundos para dar tiempo al sensor en interiores
        maximumAge
      }
    );
  }, [handlePositionSuccess, handlePositionError]);

  // Al montar el hook: comprobar si el navegador ya concedió permisos previamente
  useEffect(() => {
    // Si ya está activo por QA bypass, no consultar navigator
    if (getQaBypassSponsor()) return;

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then((result) => {
            if (result.state === 'granted') {
              // Si ya tiene permiso, verificar en segundo plano con cache habilitado
              checkProximity(false);
            }
          })
          .catch(() => {});
      } catch {
        // Ignorar excepciones en navegadores antiguos
      }
    }
  }, [checkProximity]);

  const resetBoost = useCallback(() => {
    setActiveBoost(null);
    setNearestSponsorInfo(null);
    setGeoStatus('idle');
  }, []);

  return {
    isBoostActive: Boolean(activeBoost),
    boostSponsor: activeBoost?.sponsor || null,
    distanceMeters: activeBoost?.distanceMeters != null ? Math.round(activeBoost.distanceMeters) : null,
    nearestSponsor: nearestSponsorInfo?.sponsor || null,
    proximityTier: activeBoost ? 'EnElLugar' : (nearestSponsorInfo?.tier || 'Lejos'),
    geoStatus,
    checkProximity,
    resetBoost,
    multiplier: activeBoost ? 2 : 1,
    isMock: Boolean(activeBoost?.isMock)
  };
}
