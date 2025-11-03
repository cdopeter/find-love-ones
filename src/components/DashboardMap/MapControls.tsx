'use client';

import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import WhatshotIcon from '@mui/icons-material/Whatshot';

interface MapControlsProps {
  showHeatmap: boolean;
  showParishOverlay: boolean;
  onHeatmapToggle: () => void;
  onParishOverlayToggle: () => void;
}

/**
 * Accessible map controls with ARIA labels and keyboard navigation
 */
export default function MapControls({
  showHeatmap,
  showParishOverlay,
  onHeatmapToggle,
  onParishOverlayToggle,
}: MapControlsProps) {
  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        p: 2,
        minWidth: 200,
      }}
      elevation={3}
      role="group"
      aria-label="Map controls"
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        <LayersIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 1 }} />
        Map Layers
      </Typography>
      <Stack spacing={1}>
        <FormControlLabel
          control={
            <Switch
              checked={showParishOverlay}
              onChange={onParishOverlayToggle}
              inputProps={{
                'aria-label': 'Toggle parish boundaries overlay',
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MapIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Parish Overlay
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={showHeatmap}
              onChange={onHeatmapToggle}
              inputProps={{
                'aria-label': 'Toggle heatmap layer showing request density',
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WhatshotIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Heatmap
            </Box>
          }
        />
      </Stack>
    </Paper>
  );
}
