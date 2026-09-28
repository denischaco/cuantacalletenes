import { useState, useEffect, useCallback } from 'react';
import sponsorsData from '../data/sponsors.json';
import { findNearbySponsor } from '../utils/geoUtils';
import { trackEvent } from '../services/analytics';

const GEO_THRESHOLD_METERS = 70; // 70 metros alrededor del local del sponsor

export function useSponsorGeoboost() {
  const [activeBoost, setActiveBoost] = useState(null); // { sponsor, distanceMeters }
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'checking' | 'active' | 'out_of_range' | 'denied' | 'unavailable'

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
    geoStatus,
    checkProximity,
    multiplier: activeBoost ? 2 : 1
  };
}


