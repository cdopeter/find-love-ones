'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { MissingPersonRequest, FoundUpdate } from '@/lib/types/database';

interface TrackingResultProps {
  trackingCode: string;
  onReset: () => void;
}

export default function TrackingResult({
  trackingCode,
  onReset,
}: TrackingResultProps) {
  const [request, setRequest] = useState<MissingPersonRequest | null>(null);
  const [foundUpdates, setFoundUpdates] = useState<FoundUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequestByTrackingCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { supabase } = await import('@/lib/supabase');

      // The tracking code is the first 8 characters of the UUID in uppercase
      // We need to search for requests where the ID starts with these characters (case-insensitive)
      const { data, error: fetchError } = await supabase
        .from('requests')
        .select('id, target_first_name, target_last_name, status, last_known_address, parish, message_to_person, created_at, requester_first_name, requester_last_name, requester_email')
        .ilike('id', `${trackingCode.toLowerCase()}%`)
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows found
          setError('No request found with this tracking number. Please check and try again.');
        } else {
          throw fetchError;
        }
        setLoading(false);
        return;
      }

      setRequest(data);

      // Fetch found updates for this request
      if (data.id) {
        const { data: updates, error: updatesError } = await supabase
          .from('found_updates')
          .select('id, request_id, message_from_found_party, created_at, created_by')
          .eq('request_id', data.id)
          .order('created_at', { ascending: true });

        if (updatesError) {
          console.error('Error fetching updates:', updatesError);
        } else {
          setFoundUpdates(updates || []);
        }
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    fetchRequestByTrackingCode();
  }, [fetchRequestByTrackingCode]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Looking up your request...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onReset}
        >
          Try Another Tracking Number
        </Button>
      </Paper>
    );
  }

  if (!request) {
    return (
      <Paper elevation={3} sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          No request found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onReset}
        >
          Try Another Tracking Number
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={onReset}
          sx={{ mb: 2 }}
        >
          Search Another
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PersonIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h2">
            Request Details
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tracking Number: <strong>{trackingCode}</strong>
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Person Information */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Missing Person
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {request.target_first_name} {request.target_last_name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={request.status === 'open' ? 'Open' : 'Closed'}
              color={request.status === 'open' ? 'warning' : 'success'}
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Last Known Location
            </Typography>
            <Typography variant="body1">
              {request.last_known_address}, {request.parish}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Message to Person */}
      {request.message_to_person && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Message
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {request.message_to_person}
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      {/* Updates/Messages */}
      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h6" gutterBottom>
          Updates & Messages
        </Typography>
        {foundUpdates.length > 0 ? (
          <Stack spacing={2}>
            {foundUpdates.map((update) => (
              <Paper
                key={update.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                  {update.message_from_found_party}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(update.created_at).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            No updates yet. We will post updates here as they become available.
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Request Info */}
      <Box>
        <Typography variant="body2" color="text.secondary">
          Request submitted on{' '}
          {request.created_at
            ? new Date(request.created_at).toLocaleDateString()
            : 'Unknown date'}
        </Typography>
      </Box>
    </Paper>
  );
}
