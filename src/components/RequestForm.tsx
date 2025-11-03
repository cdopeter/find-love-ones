'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { requestFormSchema, type RequestFormData } from '@/lib/validations/request-form';
import { JAMAICAN_PARISHES } from '@/lib/constants/parishes';

interface RequestFormProps {
  onSuccess: (trackingCode: string) => void;
}

export default function RequestForm({ onSuccess }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      age: undefined,
      description: '',
      last_seen_location: '',
      last_seen_date: '',
      parish: undefined,
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      notes: '',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Dynamically import supabase only when needed
      const { supabase } = await import('@/lib/supabase');

      // Prepare the data for submission
      const requestData = {
        first_name: data.first_name,
        last_name: data.last_name,
        age: data.age || null,
        description: data.description || null,
        last_seen_location: data.last_seen_location,
        last_seen_date: data.last_seen_date || null,
        parish: data.parish,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
        notes: data.notes || null,
        status: 'missing' as const,
      };

      // Insert into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('missing_person_requests')
        .insert([requestData])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Generate tracking code from the inserted record ID
      const trackingCode = insertedData.id.substring(0, 8).toUpperCase();
      
      // Call success callback with tracking code
      onSuccess(trackingCode);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Submit a Missing Person Request
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Target Person Information */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Missing Person Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  required
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  required
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Age (Optional)"
                  type="number"
                  fullWidth
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                  error={!!errors.age}
                  helperText={errors.age?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="last_seen_date"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Seen Date (Optional)"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.last_seen_date}
                  helperText={errors.last_seen_date?.message}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Physical description, clothing, distinguishing features, etc."
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          {/* Location Information */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Location Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="last_seen_location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Seen Location"
                  fullWidth
                  required
                  placeholder="e.g., Main Street, Downtown Kingston"
                  error={!!errors.last_seen_location}
                  helperText={errors.last_seen_location?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="parish"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Parish"
                  fullWidth
                  required
                  select
                  value={field.value || ''}
                  error={!!errors.parish}
                  helperText={errors.parish?.message}
                >
                  <MenuItem value="" disabled>
                    Select a parish
                  </MenuItem>
                  {JAMAICAN_PARISHES.map((parish) => (
                    <MenuItem key={parish} value={parish}>
                      {parish}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Requester Information */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Contact Information
            </Typography>
          </Grid>

          <Grid size={12}>
            <Controller
              name="contact_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Name"
                  fullWidth
                  required
                  error={!!errors.contact_name}
                  helperText={errors.contact_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contact_phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number (Optional)"
                  fullWidth
                  placeholder="876-123-4567"
                  error={!!errors.contact_phone}
                  helperText={errors.contact_phone?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="contact_email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email (Optional)"
                  fullWidth
                  type="email"
                  placeholder="your.email@example.com"
                  error={!!errors.contact_email}
                  helperText={errors.contact_email?.message}
                />
              )}
            />
          </Grid>

          {/* Optional Message */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Additional Information
            </Typography>
          </Grid>

          <Grid size={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Additional Notes (Optional)"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Any additional information that might help locate this person..."
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Grid>

          {/* Submit Button */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
