'use client';

import { useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import TrackingCodeInput from '@/components/TrackingCodeInput';
import TrackingResult from '@/components/TrackingResult';

export default function TrackerPage() {
  const [searchParams, setSearchParams] = useState<{
    trackingCode?: string;
    email?: string;
  } | null>(null);

  const handleTrackingCodeSubmit = (params: {
    trackingCode?: string;
    email?: string;
  }) => {
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchParams(null);
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
          Enter your tracking number or email address to view the status and any updates for your
          missing person request.
        </Typography>

        {!searchParams ? (
          <TrackingCodeInput onSubmit={handleTrackingCodeSubmit} />
        ) : (
          <TrackingResult
            trackingCode={searchParams.trackingCode}
            email={searchParams.email}
            onReset={handleReset}
          />
        )}
      </Box>
    </Container>
  );
}
