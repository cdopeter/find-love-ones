'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MissingPersonRequest } from '@/lib/types/database';
import { PARISH_METADATA } from '@/lib/constants/parishes';
import { getMarkerOffset } from '@/lib/utils/map';

interface MapContentProps {
  requests: MissingPersonRequest[];
  onMarkerClick: (request: MissingPersonRequest) => void;
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

export default function MapContent({ requests, onMarkerClick }: MapContentProps) {
  // Calculate parish counts for heatmap
  const parishCounts = useMemo(() => {
    const counts = new Map<string, number>();
    requests.forEach((req) => {
      counts.set(req.parish, (counts.get(req.parish) || 0) + 1);
    });
    return counts;
  }, [requests]);

  // Jamaica center coordinates
  const jamaicaCenter: [number, number] = [18.1096, -77.2975];

  return (
    <MapContainer
      center={jamaicaCenter}
      zoom={9}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Heatmap circles for each parish */}
      {Array.from(parishCounts.entries()).map(([parish, count]) => {
        const metadata = PARISH_METADATA[parish as keyof typeof PARISH_METADATA];
        if (!metadata) return null;

        const color = count > 5 ? '#d32f2f' : count > 2 ? '#f57c00' : '#fbc02d';

        return (
          <CircleMarker
            key={parish}
            center={[metadata.lat, metadata.lng]}
            radius={Math.min(count * 3, 20)}
            pathOptions={{
              fillColor: color,
              color: color,
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              <div>
                <strong>{parish}</strong>
                <br />
                Missing persons: {count}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Individual markers for each request */}
      {requests.map((request) => {
        const metadata = PARISH_METADATA[request.parish as keyof typeof PARISH_METADATA];
        if (!metadata) return null;

        // Use consistent offset based on ID to prevent markers from stacking
        const offset = getMarkerOffset(request.id);
        const lat = metadata.lat + offset.lat;
        const lng = metadata.lng + offset.lng;

        return (
          <Marker
            key={request.id}
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
              click: () => onMarkerClick(request),
            }}
          >
            <Popup>
              <div>
                <strong>
                  {request.first_name} {request.last_name}
                </strong>
                <br />
                Age: {request.age || 'N/A'}
                <br />
                Parish: {request.parish}
                <br />
                Status: <span style={{ textTransform: 'capitalize' }}>{request.status.replace('_', ' ')}</span>
                <br />
                Last seen: {request.last_seen_location}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
