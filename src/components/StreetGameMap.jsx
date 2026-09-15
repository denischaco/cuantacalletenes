import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function StreetGameMap({
  userPin,
  onPinChange,
  isRevealed,
  currentStreet,
  closestPoint,
  zoneCenter = [-27.4514, -58.9866],
  zoneZoom = 15
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const targetStreetLayerRef = useRef(null);
  const connectorLineRef = useRef(null);
  const onPinChangeRef = useRef(onPinChange);
  useEffect(() => {
    onPinChangeRef.current = onPinChange;
  }, [onPinChange]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Resistencia center (Plaza 25 de Mayo)
    const map = L.map(mapContainerRef.current, {
      center: zoneCenter,
      zoom: zoneZoom,
      zoomControl: false,
      attributionControl: true,
      minZoom: 12,
      maxZoom: 18,
      tap: false,
      bounceAtZoomLimits: true
    });

    // Touch-friendly zoom control on bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // CartoDB Dark No-Labels Tile Layer (Zero street names!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Map click handler to drop/move pin
    map.on('click', (e) => {
      if (onPinChangeRef.current) {
        onPinChangeRef.current([e.latlng.lat, e.latlng.lng]);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update map view when zone changes
  useEffect(() => {
    if (mapInstanceRef.current && zoneCenter) {
      mapInstanceRef.current.setView(zoneCenter, zoneZoom, { animate: true });
    }
  }, [zoneCenter, zoneZoom]);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userPin) {
      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="pin-pulse"></div>
          <div class="pin-circle"></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userPin, { icon: pinIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(userPin);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userPin]);

  // Handle Reveal Animation and Vectors
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous vector layers
    if (targetStreetLayerRef.current) {
      targetStreetLayerRef.current.remove();
      targetStreetLayerRef.current = null;
    }
    if (connectorLineRef.current) {
      connectorLineRef.current.remove();
      connectorLineRef.current = null;
    }

    if (isRevealed && currentStreet) {
      // 1. Draw Target Street Line or Polyline
      const pathPoints = currentStreet.path || [currentStreet.center];
      
      // Glow polyline (background thick neon line)
      const glowLine = L.polyline(pathPoints, {
        color: '#10B981',
        weight: 12,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Core street polyline
      const coreLine = L.polyline(pathPoints, {
        color: '#34D399',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Target marker at the closest point
      const targetPoint = closestPoint || currentStreet.center;
      const targetIcon = L.divIcon({
        className: 'target-pin-marker',
        html: `
          <div style="width: 22px; height: 22px; background: #10B981; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 0 14px #10B981; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:bold;">
            ✓
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      const targetMarker = L.marker(targetPoint, { icon: targetIcon });

      const group = L.featureGroup([glowLine, coreLine, targetMarker]).addTo(map);
      targetStreetLayerRef.current = group;

      // 2. Draw Connector Line if user dropped a pin
      if (userPin && targetPoint) {
        const line = L.polyline([userPin, targetPoint], {
          color: '#F48138',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.9
        }).addTo(map);

        connectorLineRef.current = line;

        // Auto-fit bounds so user sees both their guess and the street
        const bounds = L.latLngBounds([userPin, ...pathPoints]);
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 16,
          animate: true
        });
      } else {
        map.setView(currentStreet.center, 15, { animate: true });
      }
    }
  }, [isRevealed, currentStreet, closestPoint, userPin]);

  // Center button handler
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(zoneCenter, zoneZoom, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Recenter / Orientation Button for accessibility */}
      <button
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-10 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-lg px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition-transform active:scale-95"
        title="Centrar mapa en la plaza principal"
      >
        <span>🏛️</span>
        <span className="hidden sm:inline">Centrar Plaza 25 de Mayo</span>
      </button>

      {/* Legend Badge reminding of no-labels mechanic */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none bg-slate-950/80 backdrop-blur border border-slate-800/80 text-[11px] text-slate-400 px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Mapa mudo (orientate por plazas y avenidas)</span>
      </div>
    </div>
  );
}
