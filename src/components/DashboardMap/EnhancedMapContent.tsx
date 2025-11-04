'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.heat';
import { MissingPersonRequest } from '@/lib/types/database';
import { PARISH_METADATA } from '@/lib/constants/parishes';
import { getMarkerOffset } from '@/lib/utils/map';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

// Import marker cluster plugin dynamically with a promise cache
let markerClusterPromise: Promise<void> | null = null;
function ensureMarkerClusterLoaded(): Promise<void> {
  if (!markerClusterPromise && typeof window !== 'undefined') {
    markerClusterPromise = import('leaflet.markercluster').then(() => {
      // Plugin is now loaded
    });
  }
  return markerClusterPromise || Promise.resolve();
}

interface MapContentProps {
  requests: MissingPersonRequest[];
  onMarkerClick: (request: MissingPersonRequest) => void;
  selectedParish?: string;
  onParishClick?: (parish: string) => void;
  showHeatmap?: boolean;
  showParishOverlay?: boolean;
}

// Fix for default marker icons in Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to add heatmap layer
function HeatmapLayer({ requests }: { requests: MissingPersonRequest[] }) {
  const map = useMap();

  useEffect(() => {
    if (!requests.length) return;

    // Create heatmap points with intensity based on request count per location
    const points: [number, number, number][] = [];
    const locationCounts = new Map<string, number>();

    requests.forEach((req) => {
      const metadata = PARISH_METADATA[req.parish as keyof typeof PARISH_METADATA];
      if (!metadata) return;

      const offset = getMarkerOffset(req.id);
      const lat = metadata.lat + offset.lat;
      const lng = metadata.lng + offset.lng;
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

      locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
      points.push([lat, lng, 0.8]);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#fbc02d',
        0.5: '#f57c00',
        1.0: '#d32f2f',
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, requests]);

  return null;
}

// Component to handle parish overlay interactions
function ParishOverlay({
  onParishClick,
  selectedParish,
}: {
  onParishClick?: (parish: string) => void;
  selectedParish?: string;
}) {
  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/jamaica-parishes.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  const onEachFeature = (feature: Feature<Geometry, { parish?: string; name?: string; capital?: string; county?: string }>, layer: L.Layer) => {
    const parishName = feature.properties?.parish || feature.properties?.name;

    // Style based on selection
    const isSelected = selectedParish && selectedParish !== 'all' && selectedParish === parishName;

    if (layer instanceof L.Path) {
      layer.setStyle({
        fillColor: isSelected ? '#1976d2' : '#4caf50',
        fillOpacity: isSelected ? 0.4 : 0.2,
        color: isSelected ? '#0d47a1' : '#2e7d32',
        weight: isSelected ? 3 : 2,
      });
    }

    // Bind popup with parish info
    const popupContent = `
      <div>
        <strong>${parishName}</strong><br/>
        ${feature.properties?.capital ? `Capital: ${feature.properties.capital}<br/>` : ''}
        <em>Click to filter</em>
      </div>
    `;
    layer.bindPopup(popupContent);

    // Handle click
    layer.on({
      click: () => {
        if (onParishClick && parishName) {
          onParishClick(parishName);
        }
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillOpacity: 0.5,
          weight: 3,
        });
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        const isFeatureSelected =
          selectedParish && selectedParish !== 'all' && selectedParish === parishName;
        target.setStyle({
          fillOpacity: isFeatureSelected ? 0.4 : 0.2,
          weight: isFeatureSelected ? 3 : 2,
        });
      },
    });
  };

  if (!geojsonData) return null;

  return (
    <GeoJSON
      key={`geojson-${selectedParish}`}
      data={geojsonData}
      style={(feature) => {
        const parishName = feature?.properties?.parish || feature?.properties?.name;
        const isSelected =
          selectedParish && selectedParish !== 'all' && selectedParish === parishName;
        return {
          fillColor: isSelected ? '#1976d2' : '#4caf50',
          fillOpacity: isSelected ? 0.4 : 0.2,
          color: isSelected ? '#0d47a1' : '#2e7d32',
          weight: isSelected ? 3 : 2,
        };
      }}
      onEachFeature={onEachFeature}
    />
  );
}

// Component to add marker clustering
function MarkerClusterLayer({
  requests,
  onMarkerClick,
}: {
  requests: MissingPersonRequest[];
  onMarkerClick: (request: MissingPersonRequest) => void;
}) {
  const map = useMap();

  useEffect(() => {
    let markerClusterGroup: L.MarkerClusterGroup | null = null;

    const setupCluster = async () => {
      // Ensure marker cluster library is loaded
      await ensureMarkerClusterLoaded();

      // Create marker cluster group using the extended L object
      markerClusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        animate: true,
      });

      // Add markers to cluster group
      requests.forEach((request) => {
        const metadata = PARISH_METADATA[request.parish as keyof typeof PARISH_METADATA];
        if (!metadata || !markerClusterGroup) return;

        const offset = getMarkerOffset(request.id);
        const lat = metadata.lat + offset.lat;
        const lng = metadata.lng + offset.lng;

        const marker = L.marker([lat, lng], { icon });
        marker.bindPopup(`
          <div>
            <strong>${request.target_first_name} ${request.target_last_name}</strong><br />
            Parish: ${request.parish}<br />
            Status: <span style="text-transform: capitalize">${request.status}</span><br />
            Last known address: ${request.last_known_address}
          </div>
        `);

        marker.on('click', () => onMarkerClick(request));
        markerClusterGroup.addLayer(marker);
      });

      if (markerClusterGroup) {
        map.addLayer(markerClusterGroup);
      }
    };

    setupCluster();

    return () => {
      if (markerClusterGroup) {
        map.removeLayer(markerClusterGroup);
      }
    };
  }, [map, requests, onMarkerClick]);

  return null;
}

export default function MapContent({
  requests,
  onMarkerClick,
  selectedParish,
  onParishClick,
  showHeatmap = false,
  showParishOverlay = true,
}: MapContentProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Jamaica center coordinates
  const jamaicaCenter: [number, number] = [18.1096, -77.2975];

  return (
    <MapContainer
      center={jamaicaCenter}
      zoom={9}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
      ref={mapRef}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Parish Overlay */}
      {showParishOverlay && (
        <ParishOverlay onParishClick={onParishClick} selectedParish={selectedParish} />
      )}

      {/* Heatmap Layer */}
      {showHeatmap && <HeatmapLayer requests={requests} />}

      {/* Marker Clustering */}
      <MarkerClusterLayer requests={requests} onMarkerClick={onMarkerClick} />
    </MapContainer>
  );
}
