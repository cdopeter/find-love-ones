'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  MissingPersonRequest,
  RequestStatus,
  FoundUpdate,
} from '@/lib/types/database';

interface PersonDetailDrawerProps {
  request: MissingPersonRequest | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: RequestStatus) => void;
  onMessageUpdate: (id: string, message: string) => void;
}

export default function PersonDetailDrawer({
  request,
  open,
  onClose,
  onStatusUpdate,
  onMessageUpdate,
}: PersonDetailDrawerProps) {
  const [editingMessage, setEditingMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [foundUpdates, setFoundUpdates] = useState<FoundUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const fetchFoundUpdates = useCallback(async () => {
    if (!request?.id) return;

    try {
      setLoadingUpdates(true);
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('found_updates')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoundUpdates(data || []);
    } catch (err) {
      console.error('Error fetching found updates:', err);
    } finally {
      setLoadingUpdates(false);
    }
  }, [request?.id]);

  useEffect(() => {
    if (request?.id && open) {
      fetchFoundUpdates();
    }
  }, [request?.id, open, fetchFoundUpdates]);

  const handleMessageSave = async () => {
    if (request?.id) {
      await onMessageUpdate(request.id, message);
      setEditingMessage(false);
      setMessage('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Refresh the updates list
      await fetchFoundUpdates();
    }
  };

  const handleStatusChange = (newStatus: RequestStatus) => {
    if (request?.id) {
      onStatusUpdate(request.id, newStatus);
    }
  };

  if (!request) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 500 }, p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            Person Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Message saved successfully!
          </Alert>
        )}

        {/* Personal Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  First Name
                </Typography>
                <Typography variant="body1">
                  {request.target_first_name}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1">
                  {request.target_last_name}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={request.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as RequestStatus)
                  }
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Box>

        {/* Location Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Location Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Parish
              </Typography>
              <Typography variant="body1">{request.parish}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Last Known Address
              </Typography>
              <Typography variant="body1">
                {request.last_known_address}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Requester Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Requester Name
              </Typography>
              <Typography variant="body1">
                {request.requester_first_name} {request.requester_last_name}
              </Typography>
            </Box>
            {request.requester_phone && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {request.requester_phone}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{request.requester_email}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Message to Person */}
        {request.message_to_person && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Message to Person
            </Typography>
            <Typography variant="body1">{request.message_to_person}</Typography>
          </Box>
        )}

        {/* Messages from Found Party */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Updates from Found Party
          </Typography>
          {loadingUpdates ? (
            <CircularProgress size={24} />
          ) : foundUpdates.length > 0 ? (
            <Stack spacing={2}>
              {foundUpdates.map((update) => (
                <Box
                  key={update.id}
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {update.message_from_found_party}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {new Date(update.created_at).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No updates yet
            </Typography>
          )}

          {!editingMessage ? (
            <Button
              variant="outlined"
              onClick={() => setEditingMessage(true)}
              sx={{ mt: 2 }}
            >
              Add Update
            </Button>
          ) : (
            <>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter update from the found party..."
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleMessageSave}
                >
                  Save Update
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingMessage(false);
                    setMessage('');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Timestamps */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="body2" color="text.secondary">
            Created
          </Typography>
          <Typography variant="body2">
            {request.created_at
              ? new Date(request.created_at).toLocaleString()
              : 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
