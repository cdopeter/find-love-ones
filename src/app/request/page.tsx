'use client';

import { useState } from 'react';
import { Container, Box, Typography } from '@mui/material';
import RequestForm from '@/components/RequestForm';
import RequestSuccess from '@/components/RequestSuccess';

export default function RequestPage() {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const handleSuccess = (code: string) => {
    setTrackingCode(code);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {!trackingCode ? (
          <>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              align="center"
              sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}
            >
              Submit a Missing Person Report
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              paragraph
              sx={{ mb: 4, fontSize: '1.1rem' }}
            >
              Help us locate your missing loved one by providing as much detail
              as possible. All fields marked with an asterisk (*) are required.
              Your information will be shared with ODPEM and Jamaica&apos;s
              emergency response agencies.
            </Typography>
            <RequestForm onSuccess={handleSuccess} />
          </>
        ) : (
          <RequestSuccess trackingCode={trackingCode} />
        )}
      </Box>
    </Container>
  );
}
