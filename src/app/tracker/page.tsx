'use client';

import { useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import TrackingCodeInput from '@/components/TrackingCodeInput';
import TrackingResult from '@/components/TrackingResult';

export default function TrackerPage() {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const handleTrackingCodeSubmit = (code: string) => {
    setTrackingCode(code);
  };

  const handleReset = () => {
    setTrackingCode(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 2 }}
        >
          Track Your Request
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Enter your tracking number to view the status and any updates for your
          missing person request.
        </Typography>

        {!trackingCode ? (
          <TrackingCodeInput onSubmit={handleTrackingCodeSubmit} />
        ) : (
          <TrackingResult trackingCode={trackingCode} onReset={handleReset} />
        )}
      </Box>
    </Container>
  );
}
