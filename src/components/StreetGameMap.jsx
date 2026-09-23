import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, Landmark, Layers, Moon, Sun } from 'lucide-react';

import defaultReferencePoints from '../data/referencePoints.json';

// Helper to check if an icon value represents an image URL or path
function isImageIcon(iconStr, iconImage) {
  if (iconImage) return true;
  if (!iconStr || typeof iconStr !== 'string') return false;
  return (
    iconStr.startsWith('http://') ||
    iconStr.startsWith('https://') ||
    iconStr.startsWith('/') ||
    iconStr.startsWith('./') ||
    iconStr.startsWith('data:image') ||
    /\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(iconStr)
  );
}

export default function StreetGameMap({
  targetPoint,
  isRevealed,
  currentStreet,
  zoneCenter = [-27.4514, -58.9866],
  zoneZoom = 15,
  referencePoints = defaultReferencePoints
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const landmarksLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapMode, setMapMode] = useState('dark'); // 'dark' | 'satellite'

  // Helper to attach appropriate tile layer based on mapMode
  const setTileLayer = (map, mode) => {
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    if (mode === 'satellite') {
      // High-resolution satellite tiles: zero labels, zero watermarks
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri World Imagery',
          maxZoom: 19,
          className: 'clean-sat-tiles'
        }
      ).addTo(map);
    } else {
      // Dark mute roadmap: all labels disabled (s.e:l|p.v:off), zero street names, zero watermarks
      tileLayerRef.current = L.tileLayer(
        'https://mt{s}.google.com/vt/lyrs=m&apistyle=s.e:l|p.v:off&x={x}&y={y}&z={z}',
        {
          attribution: 'Google Maps (Mudo)',
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 19,
          className: 'clean-dark-tiles'
        }
      ).addTo(map);
    }
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    }

    const initialCenter = targetPoint || zoneCenter;
    const initialZoom = targetPoint ? 16 : zoneZoom;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
      minZoom: 12,
      maxZoom: 19,
      tap: false,
      bounceAtZoomLimits: true
    });

    // Touch-friendly zoom control on bottom right
    L.control
      .zoom({
        position: 'bottomright'
      })
      .addTo(map);

    // Initial tile layer
    setTileLayer(map, mapMode);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // 2. Render and dynamically update reference landmarks from JSON
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    // Clear previous landmarks layer if it exists
    if (landmarksLayerRef.current) {
      landmarksLayerRef.current.remove();
      landmarksLayerRef.current = null;
    }

    if (!Array.isArray(referencePoints) || referencePoints.length === 0) {
      return;
    }

    const landmarksGroup = L.layerGroup();

    referencePoints.forEach((lm) => {
      // Ignore if explicitly disabled
      if (lm.enabled === false) return;

      const coords = lm.pos || lm.coordinates;
      if (!coords || !Array.isArray(coords) || coords.length < 2) return;

      const isMain = lm.type === 'main_plaza';
      const isCommercial = lm.type === 'commercial' || lm.isSponsored;
      const isImg = isImageIcon(lm.icon, lm.iconImage);
      const iconSrc = lm.iconImage || lm.icon;
      const logoBg = lm.logoBg || '#FFFFFF';

      const borderColor = lm.color || (isMain || isCommercial ? '#F48138' : '#334155');
      const textColor = isCommercial ? '#FED7AA' : isMain ? '#FDBA74' : '#E2E8F0';

      let innerHtml = '';

      if (isCommercial) {
        if (isRevealed) {
          // Adivinado / Revelado: LOGO SOLO SIN NOMBRE
          const logoContent = isImg
            ? `<div class="landmark-logo-wrapper" style="background-color: ${logoBg};"><img src="${iconSrc}" alt="${lm.name}" /></div>`
            : `<span style="font-size: 18px; line-height: 1;">${lm.icon || '🍔'}</span>`;

          innerHtml = `
            <div class="landmark-ref-badge landmark-commercial-badge landmark-logo-only" title="${lm.name}">
              ${logoContent}
            </div>
          `;
        } else {
          // Antes de adivinar / En juego: ⭐ + Logo con fondo limpio + Nombre (sin caja SPONSOR invasiva)
          const logoContent = isImg
            ? `<div class="landmark-logo-wrapper" style="background-color: ${logoBg};"><img src="${iconSrc}" alt="" /></div>`
            : `<span>${lm.icon || '🍔'}</span>`;

          innerHtml = `
            <div class="landmark-ref-badge landmark-commercial-badge" title="Comercio Destacado">
              <span class="commercial-star">★</span>
              ${logoContent}
              <span style="font-weight: 700;">${lm.name}</span>
            </div>
          `;
        }
      } else {
        // Hitos habituales (plazas, parques)
        const iconHtml = isImg
          ? `<img src="${iconSrc}" class="landmark-img-icon" alt="" />`
          : `<span>${lm.icon || '📍'}</span>`;

        innerHtml = `
          <div class="landmark-ref-badge" style="
            background: rgba(15, 23, 42, 0.94);
            border: 1px solid ${borderColor};
            color: ${textColor};
          ">
            ${iconHtml}
            <span>${lm.name}</span>
          </div>
        `;
      }

      const landmarkIcon = L.divIcon({
        className: 'landmark-ref-marker',
        html: innerHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      L.marker(coords, {
        icon: landmarkIcon,
        interactive: false
      }).addTo(landmarksGroup);
    });

    landmarksGroup.addTo(map);
    landmarksLayerRef.current = landmarksGroup;

    return () => {
      if (landmarksLayerRef.current) {
        landmarksLayerRef.current.remove();
        landmarksLayerRef.current = null;
      }
    };
  }, [isMapReady, referencePoints, isRevealed]);

  // 2. Switch tile layer when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setTileLayer(map, mapMode);
  }, [mapMode]);

  // 3. Pan/zoom to targetPoint whenever targetPoint changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !targetPoint) return;

    map.setView(targetPoint, 16, { animate: true, duration: 0.8 });
  }, [targetPoint]);

  // 4. Render or update Target Marker at targetPoint
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (targetPoint) {
      const targetIcon = L.divIcon({
        className: 'target-beacon-marker',
        html: `
          <div class="beacon-pulse"></div>
          <div class="beacon-core">
            <span style="font-size: 13px; line-height: 1;">📍</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (!targetMarkerRef.current) {
        targetMarkerRef.current = L.marker(targetPoint, {
          icon: targetIcon,
          interactive: false
        }).addTo(map);
      } else {
        targetMarkerRef.current.setLatLng(targetPoint);
      }
    } else if (targetMarkerRef.current) {
      targetMarkerRef.current.remove();
      targetMarkerRef.current = null;
    }
  }, [targetPoint]);

  // Center on Target Point button
  const handleRecenterTarget = () => {
    const map = mapInstanceRef.current;
    if (map && targetPoint) {
      map.setView(targetPoint, 16, { animate: true });
    }
  };

  // Center on Plaza 25 de Mayo
  const handleRecenterPlaza = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(zoneCenter, zoneZoom, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Action Buttons (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
        {targetPoint && (
          <button
            onClick={handleRecenterTarget}
            className="bg-emerald-600/95 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-lg px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur transition-all active:scale-95 cursor-pointer"
            title="Volver a centrar en el punto a adivinar"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Centrar Punto</span>
          </button>
        )}

        <button
          onClick={handleRecenterPlaza}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-lg px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-all active:scale-95 cursor-pointer"
          title="Centrar en Plaza 25 de Mayo para orientarte"
        >
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Plaza 25 de Mayo</span>
        </button>

        {/* Map Style Toggle (Dark Mute / Satelital) */}
        <button
          onClick={() => setMapMode(prev => (prev === 'dark' ? 'satellite' : 'dark'))}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 shadow-lg px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-all active:scale-95 cursor-pointer"
          title="Cambiar entre mapa oscuro mudo y vista satelital"
        >
          {mapMode === 'dark' ? (
            <>
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ver Satelital</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Ver Mapa Oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Legend Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none bg-slate-950/85 backdrop-blur border border-slate-800/80 text-[11px] text-slate-300 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#339136] shadow-sm shadow-emerald-400 animate-pulse" />
        <span>Sin nombres de calles (orientate por plazas y lagunas)</span>
      </div>
    </div>
  );
}
