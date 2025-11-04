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

const trackingCodeSchema = z.object({
  trackingCode: z
    .string()
    .min(1, 'Tracking number is required')
    .min(8, 'Tracking number must be at least 8 characters')
    .regex(/^[A-Z0-9]+$/i, 'Tracking number must contain only letters and numbers'),
});

type TrackingCodeFormData = z.infer<typeof trackingCodeSchema>;

interface TrackingCodeInputProps {
  onSubmit: (code: string) => void;
}

export default function TrackingCodeInput({ onSubmit }: TrackingCodeInputProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingCodeFormData>({
    resolver: zodResolver(trackingCodeSchema),
    defaultValues: {
      trackingCode: '',
    },
  });

  const onFormSubmit = (data: TrackingCodeFormData) => {
    setError(null);
    // Convert to uppercase to match the tracking code format
    const formattedCode = data.trackingCode.trim().toUpperCase();
    onSubmit(formattedCode);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <SearchIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Enter Your Tracking Number
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You received this tracking number when you submitted your request.
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
              required
              placeholder="e.g., ABC12345"
              error={!!errors.trackingCode}
              helperText={errors.trackingCode?.message || 'Enter the 8-character tracking code'}
              sx={{ mb: 3 }}
              inputProps={{
                style: { textTransform: 'uppercase' },
              }}
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
