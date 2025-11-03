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
              sx={{ mb: 4 }}
            >
              Submit a Request
            </Typography>
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              Help us locate your missing loved one by providing as much detail
              as possible. All fields marked with an asterisk (*) are required.
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
