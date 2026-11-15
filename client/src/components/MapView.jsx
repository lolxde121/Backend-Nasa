import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export function MapView({
  lat = 19.5124,
  lng = -98.8828,
  seed = 11,
  pin,
  satellite = false,
  draft = [],
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
  const polygonLayerRef = useRef(null);
  const draftLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);

  // Fallback si lat/lng no son numéricos
  const currentLat = typeof lat === 'number' && !isNaN(lat) ? lat : 19.5124;
  const currentLng = typeof lng === 'number' && !isNaN(lng) ? lng : -98.8828;

  // Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya existe instancia, limpiarla antes de reinstanciar
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
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
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
      if (labelLayerRef.current) {
        map.removeLayer(labelLayerRef.current);
        labelLayerRef.current = null;
      }

      if (isSat) {
        // Esri World Imagery (Satélite Real de Alta Resolución)
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, maxNativeZoom: 18 }
        ).addTo(map);

        // Nombres de caminos y límites en vista satelital
        labelLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, opacity: 0.85 }
        ).addTo(map);
      } else {
        // OpenStreetMap estándar (Calles, relieve y localidades)
        tileLayerRef.current = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19 }
        ).addTo(map);
      }
    };

    updateTileLayer(satellite);

    // Evento de clic en el mapa para colocar el pin o marcar polígonos
    if (onPick) {
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        // Si el marcador existe y estamos seleccionando ubicación, moverlo de inmediato
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        }
        // Calcular coordenadas x, y relativas de referencia
        const container = mapContainerRef.current;
        const rect = container ? container.getBoundingClientRect() : { width: 600, height: 360 };
        const point = map.latLngToContainerPoint(e.latlng);
        const x = (point.x / (rect.width || 600)) * 600;
        const y = (point.y / (rect.height || 360)) * 360;

        onPick(x, y, { lat: clickLat, lng: clickLng });
      });
    }

    // Invalidate size después del render inicial para evitar franjas grises
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [slice]);

  // Actualizar tipo de capa (Calles vs Satélite) dinámicamente
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
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

  // Actualizar posición del marcador y centrado de mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const isDraggable = !slice && typeof onPick === 'function';

    // Crear icono de ubicación reconocible y destacado para el usuario
    const customPinIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: ${isDraggable ? 'grab' : 'default'};">
          <!-- Pulso de radar en la base del terreno -->
          <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 34px; height: 34px; border-radius: 9999px; background: rgba(225, 29, 72, 0.4); pointer-events: none; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <!-- Icono de ubicación (Pin de mapa clásico con diseño moderno) -->
          <div style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.38)); transition: transform 0.15s ease;">
            <svg width="38" height="48" viewBox="0 0 384 512" fill="none">
              <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" fill="#E11D48"/>
              <path d="M192 72c-66.274 0-120 53.726-120 120s53.726 120 120 120 120-53.726 120-120-53.726-120-120-120z" fill="#FFFFFF"/>
              <circle cx="192" cy="192" r="70" fill="#0B3D91"/>
              <circle cx="192" cy="192" r="30" fill="#FFFFFF"/>
            </svg>
          </div>
          <!-- Etiqueta informativa de la ubicación -->
          ${label ? `<div style="background: rgba(15,23,42,0.92); color: white; padding: 3px 9px; border-radius: 9999px; font-size: 11px; font-weight: 700; white-space: nowrap; margin-top: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.25); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">${label}</div>` : ''}
          ${isDraggable ? `<div style="background: #0B3D91; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap; margin-top: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.35);">📍 Arrastra o toca</div>` : ''}
        </div>
      `,
      iconSize: [38, 48],
      iconAnchor: [19, 48]
    });

    if (showPin) {
      if (!markerRef.current) {
        const marker = L.marker([currentLat, currentLng], {
          icon: customPinIcon,
          draggable: isDraggable
        }).addTo(map);

        if (isDraggable) {
          marker.on('dragend', (e) => {
            const newLL = e.target.getLatLng();
            const container = mapContainerRef.current;
            const rect = container ? container.getBoundingClientRect() : { width: 600, height: 360 };
            const point = map.latLngToContainerPoint(newLL);
            const x = (point.x / (rect.width || 600)) * 600;
            const y = (point.y / (rect.height || 360)) * 360;
            if (onPick) onPick(x, y, { lat: newLL.lat, lng: newLL.lng });
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
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (!slice) {
      map.panTo([currentLat, currentLng]);
    } else {
      map.setView([currentLat, currentLng], 13);
    }
  }, [currentLat, currentLng, showPin, label, slice, onPick]);

  // Dibujar polígono guardado o polígono del terreno
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (poly && Array.isArray(poly) && poly.length >= 3) {
      // Si el polígono tiene coordenadas [lat, lng] o { lat, lng }
      let latlngs = [];
      if (Array.isArray(poly[0])) {
        latlngs = poly;
      } else if (poly[0].lat != null && poly[0].lng != null) {
        latlngs = poly.map(p => [p.lat, p.lng]);
      } else if (poly[0].x != null && poly[0].y != null) {
        // Convertir de px a latlng aproximado centrado
        latlngs = poly.map(p => [
          currentLat - (p.y - 180) * 0.0003,
          currentLng + (p.x - 300) * 0.0003
        ]);
      }

      if (latlngs.length >= 3) {
        polygonLayerRef.current = L.polygon(latlngs, {
          color: '#2BB3A3',
          weight: 3,
          fillColor: '#2BB3A3',
          fillOpacity: 0.25,
          dashArray: 'none'
        }).addTo(map);
      }
    }
  }, [poly, currentLat, currentLng]);

  // Dibujar puntos en modo trazado interactivo (draft)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (draftLayerRef.current) {
      map.removeLayer(draftLayerRef.current);
      draftLayerRef.current = null;
    }

    if (draft && Array.isArray(draft) && draft.length > 0) {
      const group = L.layerGroup();

      let ptsLatLng = [];
      draft.forEach((p, idx) => {
        const ptLat = p.lat ?? (currentLat - (p.y - 180) * 0.0003);
        const ptLng = p.lng ?? (currentLng + (p.x - 300) * 0.0003);
        ptsLatLng.push([ptLat, ptLng]);

        const vertexMarker = L.circleMarker([ptLat, ptLng], {
          radius: 6,
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          color: '#0B3D91',
          weight: 3
        });
        group.addLayer(vertexMarker);
      });

      if (ptsLatLng.length >= 2) {
        const polyLineOrGun = L.polygon(ptsLatLng, {
          color: '#0B3D91',
          weight: 2.5,
          fillColor: '#4FA3E0',
          fillOpacity: ptsLatLng.length >= 3 ? 0.25 : 0,
          dashArray: ptsLatLng.length >= 3 ? undefined : '5, 5'
        });
        group.addLayer(polyLineOrGun);
      }

      group.addTo(map);
      draftLayerRef.current = group;
    }
  }, [draft, currentLat, currentLng]);

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
