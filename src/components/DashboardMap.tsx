'use client';

import dynamic from 'next/dynamic';
import { MissingPersonRequest } from '@/lib/types/database';
import { Box } from '@mui/material';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface DashboardMapProps {
  requests: MissingPersonRequest[];
  onMarkerClick: (request: MissingPersonRequest) => void;
}

// Dynamically import MapContent to avoid SSR issues with Leaflet
const MapContent = dynamic(() => import('./DashboardMap/MapContent'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Loading map...
    </Box>
  ),
});

export default function DashboardMap({ requests, onMarkerClick }: DashboardMapProps) {
  return (
    <Box sx={{ width: '100%', height: '420px', position: 'relative' }}>
      <MapContent requests={requests} onMarkerClick={onMarkerClick} />
    </Box>
  );
}
