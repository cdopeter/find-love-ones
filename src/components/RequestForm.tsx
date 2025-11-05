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
import {
  requestFormSchema,
  type RequestFormData,
} from '@/lib/validations/request-form';
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
      target_first_name: '',
      target_last_name: '',
      age: undefined,
      gender: '',
      nickname: '',
      last_known_address: '',
      parish: undefined,
      requester_first_name: '',
      requester_last_name: '',
      requester_phone: '',
      requester_email: '',
      message_to_person: '',
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
        target_first_name: data.target_first_name,
        target_last_name: data.target_last_name,
        age: data.age || null,
        gender: data.gender || null,
        nickname: data.nickname || null,
        last_known_address: data.last_known_address,
        parish: data.parish,
        requester_first_name: data.requester_first_name,
        requester_last_name: data.requester_last_name,
        requester_email: data.requester_email,
        requester_phone: data.requester_phone || null,
        message_to_person: data.message_to_person || null,
        status: 'open' as const,
      };

      // Insert into Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from('requests')
        .insert([requestData])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Generate tracking code from the inserted record ID
      // Use the first 8 characters of the UUID for the tracking code
      const trackingCode = insertedData.id
        ? String(insertedData.id).substring(0, 8).toUpperCase()
        : 'REQ' + Date.now().toString(36).toUpperCase().substring(0, 8);

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
              name="target_first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  fullWidth
                  required
                  error={!!errors.target_first_name}
                  helperText={errors.target_first_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="target_last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Name"
                  fullWidth
                  required
                  error={!!errors.target_last_name}
                  helperText={errors.target_last_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Age (Optional)"
                  fullWidth
                  type="number"
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

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gender (Optional)"
                  fullWidth
                  placeholder="e.g., Male, Female, Non-binary"
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="nickname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nickname (Optional)"
                  fullWidth
                  placeholder="e.g., Johnny, Jay"
                  error={!!errors.nickname}
                  helperText={errors.nickname?.message}
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
              name="last_known_address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Last Known Address"
                  fullWidth
                  required
                  placeholder="e.g., Main Street, Downtown Kingston"
                  error={!!errors.last_known_address}
                  helperText={errors.last_known_address?.message}
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="requester_first_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your First Name"
                  fullWidth
                  required
                  error={!!errors.requester_first_name}
                  helperText={errors.requester_first_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="requester_last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Last Name"
                  fullWidth
                  required
                  error={!!errors.requester_last_name}
                  helperText={errors.requester_last_name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="requester_phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number (Optional)"
                  fullWidth
                  placeholder="876-123-4567"
                  error={!!errors.requester_phone}
                  helperText={errors.requester_phone?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="requester_email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  required
                  type="email"
                  placeholder="your.email@example.com"
                  error={!!errors.requester_email}
                  helperText={errors.requester_email?.message}
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
              name="message_to_person"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Message to Person (Optional)"
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Any message you would like to send to the person..."
                  error={!!errors.message_to_person}
                  helperText={errors.message_to_person?.message}
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
