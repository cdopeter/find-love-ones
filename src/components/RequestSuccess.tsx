'use client';

import { Box, Typography, Paper, Button, Alert, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RequestSuccessProps {
  trackingCode: string;
}

export default function RequestSuccess({ trackingCode }: RequestSuccessProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyTrackingCode = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy tracking code:', err);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        textAlign: 'center',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Request Submitted Successfully!
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Your missing person request has been received and is now being
          processed by our team and community partners.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Tracking Code
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'background.default',
            mb: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: 2,
              color: 'primary.main',
            }}
          >
            {trackingCode}
          </Typography>
        </Paper>
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyTrackingCode}
          sx={{ mb: 1 }}
        >
          {copied ? 'Copied!' : 'Copy Tracking Code'}
        </Button>
        {copied && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Tracking code copied to clipboard!
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          What Happens Next?
        </Typography>
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="body2" paragraph>
            • Your request will be reviewed by our response team
          </Typography>
          <Typography variant="body2" paragraph>
            • The information will be shared with trusted community partners
          </Typography>
          <Typography variant="body2" paragraph>
            • You will be contacted if any updates are available
          </Typography>
          <Typography variant="body2" paragraph>
            • Use your tracking code to check the status of your request
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="body2">
          <strong>Important:</strong> Please save your tracking code. You will
          need it to check updates on your request.
        </Typography>
      </Alert>

      <Button
        variant="contained"
        size="large"
        startIcon={<HomeIcon />}
        onClick={handleGoHome}
        fullWidth
      >
        Return to Home
      </Button>
    </Paper>
  );
}
