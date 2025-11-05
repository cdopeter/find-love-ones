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
    trackingCode: z.string(),
    email: z.string(),
  })
  .superRefine((data, ctx) => {
    const trackingCodeProvided = data.trackingCode && data.trackingCode.length > 0;
    const emailProvided = data.email && data.email.length > 0;

    // Validate tracking code if provided
    if (trackingCodeProvided) {
      if (data.trackingCode.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['trackingCode'],
          message: 'Tracking number must be at least 8 characters',
        });
      } else if (!/^[A-Z0-9]+$/i.test(data.trackingCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['trackingCode'],
          message: 'Tracking number must contain only letters and numbers',
        });
      }
    }

    // Validate email if provided
    if (emailProvided) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Please enter a valid email address',
        });
      }
    }

    // Check that at least one field is provided and valid
    if (!trackingCodeProvided && !emailProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['trackingCode'],
        message: 'Please provide either a tracking number or an email address',
      });
    }
  });

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
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      trackingCode: '',
      email: '',
    },
  });

  const onFormSubmit = (data: TrackingCodeFormData) => {
    setError(null);
    const params: { trackingCode?: string; email?: string } = {};
    
    // Convert tracking code to uppercase if provided
    if (data.trackingCode && data.trackingCode.trim().length >= 8) {
      params.trackingCode = data.trackingCode.trim().toUpperCase();
    }
    
    // Include email if provided
    if (data.email && data.email.trim().length > 0) {
      params.email = data.email.trim().toLowerCase();
    }
    
    onSubmit(params);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <SearchIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Track Your Request
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your tracking number or email address to view your request.
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
              label="Tracking Number"
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

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address"
              type="email"
              fullWidth
              placeholder="e.g., your@email.com"
              error={!!errors.email}
              helperText={
                errors.email?.message ||
                'Or enter the email used when submitting the request'
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
