'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const trackingCodeSchema = z
  .object({
    trackingCode: z.string().optional(),
    email: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasTrackingCode = data.trackingCode && data.trackingCode.trim();
      const hasEmail = data.email && data.email.trim();
      return hasTrackingCode || hasEmail;
    },
    {
      message: 'Please provide either a tracking number or email address',
      path: ['trackingCode'],
    }
  )
  .refine(
    (data) => {
      // Validate tracking code if provided
      if (data.trackingCode && data.trackingCode.trim()) {
        const val = data.trackingCode.trim();
        return val.length >= 8 && /^[A-Z0-9]+$/i.test(val);
      }
      return true;
    },
    {
      message:
        'Tracking number must be at least 8 characters and contain only letters and numbers',
      path: ['trackingCode'],
    }
  )
  .refine(
    (data) => {
      // Validate email if provided
      if (data.email && data.email.trim()) {
        return z.string().email().safeParse(data.email.trim()).success;
      }
      return true;
    },
    {
      message: 'Please enter a valid email address',
      path: ['email'],
    }
  );

type TrackingCodeFormData = z.infer<typeof trackingCodeSchema>;

interface TrackingCodeInputProps {
  onSubmit: (params: { trackingCode?: string; email?: string }) => void;
}

export default function TrackingCodeInput({
  onSubmit,
}: TrackingCodeInputProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingCodeFormData>({
    resolver: zodResolver(trackingCodeSchema),
    defaultValues: {
      trackingCode: '',
      email: '',
    },
  });

  const onFormSubmit = (data: TrackingCodeFormData) => {
    setError(null);

    const trackingCode = data.trackingCode?.trim();
    const email = data.email?.trim();

    const result: { trackingCode?: string; email?: string } = {};

    if (trackingCode) {
      result.trackingCode = trackingCode.toUpperCase();
    }

    if (email) {
      result.email = email;
    }

    onSubmit(result);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <SearchIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Track Your Request
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your tracking number or the email address you used when submitting your request.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Controller
          name="trackingCode"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tracking Number (Optional)"
              fullWidth
              placeholder="e.g., ABC12345"
              error={!!errors.trackingCode}
              helperText={
                errors.trackingCode?.message ||
                'Enter the 8-character tracking code'
              }
              sx={{ mb: 2 }}
              inputProps={{
                style: { textTransform: 'uppercase' },
              }}
            />
          )}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 2 }}
        >
          - OR -
        </Typography>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address (Optional)"
              fullWidth
              type="email"
              placeholder="e.g., your.email@example.com"
              error={!!errors.email}
              helperText={
                errors.email?.message ||
                'Enter the email you used when submitting your request'
              }
              sx={{ mb: 3 }}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          startIcon={<SearchIcon />}
        >
          Track Request
        </Button>
      </form>
    </Paper>
  );
}
