import { useEffect, useRef } from 'react';
import L from 'leaflet';

export function MapView({
  lat = 19.5124,
  lng = -98.8828,
  seed = 11,
  pin,
  satellite = false,
  poly = null,
  onPick = null,
  slice = false,
  showPin = true,
  label = '',
  zoom = 15
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);

  // Fallback si lat/lng no son numéricos
  const currentLat = typeof lat === 'number' && !isNaN(lat) ? lat : 19.5124;
  const currentLng = typeof lng === 'number' && !isNaN(lng) ? lng : -98.8828;

  // Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya existe instancia previa, limpiarla por completo
    if (markerRef.current) {
      try { markerRef.current.remove(); } catch(e) {}
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch(e) {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: slice ? 13 : zoom,
      zoomControl: !slice,
      dragging: !slice,
      scrollWheelZoom: !slice,
      doubleClickZoom: !slice,
      boxZoom: !slice,
      touchZoom: !slice,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Capa de mosaicos (Calles vs Satélite)
    const updateTileLayer = (isSat) => {
      if (tileLayerRef.current) {
        try { map.removeLayer(tileLayerRef.current); } catch(e) {}
        tileLayerRef.current = null;
      }
      if (labelLayerRef.current) {
        try { map.removeLayer(labelLayerRef.current); } catch(e) {}
        labelLayerRef.current = null;
      }

      if (isSat) {
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, maxNativeZoom: 18 }
        ).addTo(map);

        labelLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, opacity: 0.85 }
        ).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19 }
        ).addTo(map);
      }
    };

    updateTileLayer(satellite);

    // Evento de clic en el mapa para posicionar el pin
    if (onPick) {
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current && map.hasLayer(markerRef.current)) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        }
        onPick(0, 0, { lat: clickLat, lng: clickLng });
      });
    }

    // Invalidate size después del render inicial para evitar franjas grises
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      if (markerRef.current) {
        try { markerRef.current.remove(); } catch(e) {}
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch(e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [slice]);

  // Actualizar tipo de capa (Calles vs Satélite) dinámicamente
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      try { map.removeLayer(tileLayerRef.current); } catch(e) {}
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      try { map.removeLayer(labelLayerRef.current); } catch(e) {}
      labelLayerRef.current = null;
    }

    if (satellite) {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, maxNativeZoom: 18 }
      ).addTo(map);

      labelLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      ).addTo(map);
    }
  }, [satellite]);

  // Posicionar y actualizar el icono de ubicación (marcador movible)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const isDraggable = !slice && typeof onPick === 'function';

    // Icono SVG de ubicación grande, claro y de alto contraste
    const customPinIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: ${isDraggable ? 'grab' : 'default'};">
          <!-- Pulso de radar en la base de la coordenada -->
          <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 40px; height: 40px; border-radius: 9999px; background: rgba(225, 29, 72, 0.45); pointer-events: none; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Icono de ubicación clásico: gota roja con centro blanco/azul -->
          <div style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.45)); transform: translateZ(0); transition: transform 0.15s ease;">
            <svg width="44" height="54" viewBox="0 0 384 512" fill="none">
              <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#DC2626" stroke="#FFFFFF" stroke-width="12"/>
              <circle cx="192" cy="192" r="90" fill="#FFFFFF"/>
              <circle cx="192" cy="192" r="60" fill="#0B3D91"/>
              <circle cx="192" cy="192" r="26" fill="#FFFFFF"/>
            </svg>
          </div>
          <!-- Etiqueta clara con tipografía grande y legible -->
          ${label ? `<div style="background: rgba(15,23,42,0.94); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 800; white-space: nowrap; margin-top: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 1.5px solid rgba(255,255,255,0.3); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">${label}</div>` : ''}
          ${isDraggable ? `<div style="background: #0B3D91; color: white; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 800; white-space: nowrap; margin-top: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 1.5px solid rgba(255,255,255,0.4);">📍 Arrastra o toca</div>` : ''}
        </div>
      `,
      iconSize: [44, 54],
      iconAnchor: [22, 54]
    });

    if (showPin) {
      // Si el marcador no existe o no está añadido al mapa activo actual
      if (!markerRef.current || !map.hasLayer(markerRef.current)) {
        if (markerRef.current) {
          try { markerRef.current.remove(); } catch(e) {}
        }
        const marker = L.marker([currentLat, currentLng], {
          icon: customPinIcon,
          draggable: isDraggable,
          zIndexOffset: 1000
        }).addTo(map);

        if (isDraggable) {
          marker.on('dragend', (e) => {
            const newLL = e.target.getLatLng();
            if (onPick) onPick(0, 0, { lat: newLL.lat, lng: newLL.lng });
          });
        }
        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng([currentLat, currentLng]);
        markerRef.current.setIcon(customPinIcon);
        if (markerRef.current.dragging) {
          if (isDraggable) markerRef.current.dragging.enable();
          else markerRef.current.dragging.disable();
        }
      }
    } else if (markerRef.current) {
      try { map.removeLayer(markerRef.current); } catch(e) {}
      markerRef.current = null;
    }

    if (!slice) {
      map.panTo([currentLat, currentLng]);
    } else {
      map.setView([currentLat, currentLng], 13);
    }
  }, [currentLat, currentLng, showPin, label, slice, onPick]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${onPick ? 'cursor-crosshair' : ''}`}>
      <div
        ref={mapContainerRef}
        className="h-full w-full select-none"
        style={{ minHeight: slice ? '100%' : '260px' }}
      />
      {slice && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      )}
    </div>
  );
}
