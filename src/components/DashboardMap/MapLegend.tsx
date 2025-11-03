'use client';

import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupWorkIcon from '@mui/icons-material/GroupWork';

interface MapLegendProps {
  totalRequests: number;
  showHeatmap: boolean;
}

/**
 * Accessible map legend explaining symbols and colors
 */
export default function MapLegend({ totalRequests, showHeatmap }: MapLegendProps) {
  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        p: 2,
        maxWidth: 280,
      }}
      elevation={3}
      role="complementary"
      aria-label="Map legend"
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
        Legend
      </Typography>
      <Stack spacing={1.5}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 20, color: '#1976d2', mr: 1 }} />
            <Typography variant="body2">Individual Request</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
            Click marker to view details
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <GroupWorkIcon sx={{ fontSize: 20, color: '#f57c00', mr: 1 }} />
            <Typography variant="body2">Cluster ({totalRequests} total)</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
            Click to zoom and expand
          </Typography>
        </Box>

        {showHeatmap && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Heatmap Density:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
              <Box
                sx={{
                  width: 30,
                  height: 12,
                  background: 'linear-gradient(to right, #fbc02d, #f57c00, #d32f2f)',
                  borderRadius: 1,
                }}
                role="img"
                aria-label="Heatmap color scale from low (yellow) to high (red) density"
              />
              <Typography variant="caption" color="text.secondary">
                Low → High
              </Typography>
            </Box>
          </Box>
        )}

        <Box>
          <Typography variant="body2" gutterBottom>
            Parish Overlay:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label="Default"
              size="small"
              sx={{
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                borderColor: '#2e7d32',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            />
            <Chip
              label="Selected"
              size="small"
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.4)',
                borderColor: '#0d47a1',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Click parish boundary to filter
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
