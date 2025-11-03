'use client';

import dynamic from 'next/dynamic';
import { MissingPersonRequest } from '@/lib/types/database';
import { Box } from '@mui/material';
import MapControls from './DashboardMap/MapControls';
import MapLegend from './DashboardMap/MapLegend';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface DashboardMapProps {
  requests: MissingPersonRequest[];
  onMarkerClick: (request: MissingPersonRequest) => void;
  selectedParish?: string;
  onParishClick?: (parish: string) => void;
  showHeatmap?: boolean;
  showParishOverlay?: boolean;
  onHeatmapToggle?: () => void;
  onParishOverlayToggle?: () => void;
}

// Dynamically import MapContent to avoid SSR issues with Leaflet
const MapContent = dynamic(() => import('./DashboardMap/EnhancedMapContent'), {
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

export default function DashboardMap({
  requests,
  onMarkerClick,
  selectedParish,
  onParishClick,
  showHeatmap = false,
  showParishOverlay = true,
  onHeatmapToggle,
  onParishOverlayToggle,
}: DashboardMapProps) {
  return (
    <Box sx={{ width: '100%', height: '420px', position: 'relative' }}>
      <MapContent
        requests={requests}
        onMarkerClick={onMarkerClick}
        selectedParish={selectedParish}
        onParishClick={onParishClick}
        showHeatmap={showHeatmap}
        showParishOverlay={showParishOverlay}
      />
      {onHeatmapToggle && onParishOverlayToggle && (
        <MapControls
          showHeatmap={showHeatmap}
          showParishOverlay={showParishOverlay}
          onHeatmapToggle={onHeatmapToggle}
          onParishOverlayToggle={onParishOverlayToggle}
        />
      )}
      <MapLegend totalRequests={requests.length} showHeatmap={showHeatmap} />
    </Box>
  );
}
