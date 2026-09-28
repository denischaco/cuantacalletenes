import { useState, useEffect, useCallback } from 'react';
import sponsorsData from '../data/sponsors.json';
import { findNearbySponsor } from '../utils/geoUtils';
import { trackEvent } from '../services/analytics';

const GEO_THRESHOLD_METERS = 70; // 70 metros alrededor del local del sponsor

export function useSponsorGeoboost() {
  const [activeBoost, setActiveBoost] = useState(null); // { sponsor, distanceMeters }
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'checking' | 'active' | 'out_of_range' | 'denied' | 'unavailable'

  // Verificar si hay simulación forzada por query parameter (ej: ?boost=1 o ?boost=bacanal o ?boost=fichita)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const boostParam = params.get('boost');
        if (boostParam) {
          const targetSponsor =
            boostParam === 'fichita' || boostParam === 'pellegrini'
              ? sponsorsData.find((s) => s.id === 'fichita')
              : sponsorsData[0]; // Bacanal por defecto

          if (targetSponsor) {
            setActiveBoost({ sponsor: targetSponsor, distanceMeters: 18, isSimulated: true });
            setGeoStatus('active');
          }
        }
      }
    } catch {
      // Ignorar errores de URL
    }
  }, []);

  const checkProximity = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }

    setGeoStatus('checking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const match = findNearbySponsor(latitude, longitude, sponsorsData, GEO_THRESHOLD_METERS);

        if (match) {
          setActiveBoost(match);
          setGeoStatus('active');
          trackEvent('geoboost_detected', {
            sponsor_id: match.sponsor.id,
            sponsor_name: match.sponsor.name,
            distance_meters: match.distanceMeters,
            accuracy_meters: Math.round(accuracy)
          });
        } else {
          setActiveBoost(null);
          setGeoStatus('out_of_range');
        }
      },
      (error) => {
        console.warn('[GeoBoost] Error de ubicación o permiso denegado:', error.message);
        setGeoStatus('denied');
        setActiveBoost(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache de 1 minuto para optimizar rendimiento y batería
      }
    );
  }, []);

  // Permite simular el boosteo para testing, demos o usuarios en desarrollo
  const simulateBoost = useCallback((sponsorId = 'bacanal') => {
    if (!sponsorId) {
      setActiveBoost(null);
      setGeoStatus('idle');
      return;
    }
    const target = sponsorsData.find((s) => s.id === sponsorId) || sponsorsData[0];
    if (target) {
      setActiveBoost({ sponsor: target, distanceMeters: 25, isSimulated: true });
      setGeoStatus('active');
    }
  }, []);

  // Comprobar al montar si el usuario ya otorgó permiso de ubicación previamente
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then((result) => {
            if (result.state === 'granted') {
              checkProximity();
            }
          })
          .catch(() => {});
      } catch {
        // Ignorar excepciones en navegadores antiguos
      }
    }
  }, [checkProximity]);

  return {
    isBoostActive: Boolean(activeBoost),
    boostSponsor: activeBoost?.sponsor || null,
    distanceMeters: activeBoost?.distanceMeters || null,
    isSimulated: Boolean(activeBoost?.isSimulated),
    geoStatus,
    checkProximity,
    simulateBoost,
    multiplier: activeBoost ? 2 : 1
  };
}

