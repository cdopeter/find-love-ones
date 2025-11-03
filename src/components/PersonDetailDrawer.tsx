'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { MissingPersonRequest, RequestStatus } from '@/lib/types/database';

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

  const handleMessageSave = () => {
    if (request?.id) {
      onMessageUpdate(request.id, message);
      setEditingMessage(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                <Typography variant="body1">{request.first_name}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Name
                </Typography>
                <Typography variant="body1">{request.last_name}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Age
                </Typography>
                <Typography variant="body1">{request.age || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={request.status}
                    onChange={(e) => handleStatusChange(e.target.value as RequestStatus)}
                  >
                    <MenuItem value="missing">Missing</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="found">Found</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Description */}
        {request.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">{request.description}</Typography>
          </Box>
        )}

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
                Last Seen Location
              </Typography>
              <Typography variant="body1">{request.last_seen_location}</Typography>
            </Box>
            {request.last_seen_date && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Seen Date
                </Typography>
                <Typography variant="body1">
                  {new Date(request.last_seen_date).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Contact Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Contact Name
              </Typography>
              <Typography variant="body1">{request.contact_name}</Typography>
            </Box>
            {request.contact_phone && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{request.contact_phone}</Typography>
              </Box>
            )}
            {request.contact_email && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{request.contact_email}</Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Notes */}
        {request.notes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Additional Notes
            </Typography>
            <Typography variant="body1">{request.notes}</Typography>
          </Box>
        )}

        {/* Message from Found Party */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Message from Found Party
          </Typography>
          {!editingMessage ? (
            <>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {request.message_from_found || 'No message yet'}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setMessage(request.message_from_found || '');
                  setEditingMessage(true);
                }}
              >
                {request.message_from_found ? 'Edit Message' : 'Add Message'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message from the found party..."
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleMessageSave}>
                  Save Message
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2">
              {request.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body2">
              {request.updated_at ? new Date(request.updated_at).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
