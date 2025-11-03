'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import DashboardMap from '@/components/DashboardMap';
import DashboardTable from '@/components/DashboardTable';
import PersonDetailDrawer from '@/components/PersonDetailDrawer';
import { MissingPersonRequest } from '@/lib/types/database';
import { JAMAICAN_PARISHES } from '@/lib/constants/parishes';
import { exportToCSV } from '@/lib/utils/csv-export';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [requests, setRequests] = useState<MissingPersonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParish, setSelectedParish] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<MissingPersonRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      // Lazy load supabase to avoid build-time errors
      const { supabase } = await import('@/lib/supabase');
      const { data, error: fetchError } = await supabase
        .from('missing_person_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (selectedParish === 'all') return requests;
    return requests.filter((req) => req.parish === selectedParish);
  }, [requests, selectedParish]);

  const handleParishChange = (event: SelectChangeEvent) => {
    setSelectedParish(event.target.value);
  };

  const handleStatusUpdate = async (id: string, newStatus: 'missing' | 'found' | 'in_progress') => {
    try {
      // Find the current request to get old status
      const currentRequest = requests.find((req) => req.id === id);
      const oldStatus = currentRequest?.status || null;

      const { supabase } = await import('@/lib/supabase');
      const { error: updateError } = await supabase
        .from('missing_person_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      const updatedRequest = {
        ...currentRequest!,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      setRequests((prev) =>
        prev.map((req) => (req.id === id ? updatedRequest : req))
      );

      // Handle notification and audit logging
      const { handleStatusChangeNotification } = await import('@/lib/services/notification');
      await handleStatusChangeNotification({
        request: updatedRequest,
        oldStatus,
        newStatus,
        changedBy: 'anonymous-dashboard-user', // User identifier when authentication is not yet implemented
      });

      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Error updating status:', err);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleMessageUpdate = async (id: string, message: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error: updateError } = await supabase
        .from('missing_person_requests')
        .update({ message_from_found: message, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, message_from_found: message, updated_at: new Date().toISOString() } : req
        )
      );
      setSnackbar({ open: true, message: 'Message updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Error updating message:', err);
      setSnackbar({ open: true, message: 'Failed to update message', severity: 'error' });
    }
  };

  const handleRowClick = (request: MissingPersonRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredRequests);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Responder Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={filteredRequests.length === 0}
          >
            Export CSV
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Parish Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="parish-filter-label">Filter by Parish</InputLabel>
            <Select
              labelId="parish-filter-label"
              id="parish-filter"
              value={selectedParish}
              label="Filter by Parish"
              onChange={handleParishChange}
            >
              <MenuItem value="all">All Parishes</MenuItem>
              {JAMAICAN_PARISHES.map((parish) => (
                <MenuItem key={parish} value={parish}>
                  {parish}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Map View */}
        <Paper sx={{ p: 2, mb: 3, height: '500px' }}>
          <Typography variant="h6" gutterBottom>
            Map View
          </Typography>
          <DashboardMap requests={filteredRequests} onMarkerClick={handleRowClick} />
        </Paper>

        {/* Table View */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Missing Persons ({filteredRequests.length})
          </Typography>
          <DashboardTable
            requests={filteredRequests}
            onStatusUpdate={handleStatusUpdate}
            onRowClick={handleRowClick}
          />
        </Paper>

        {/* Detail Drawer */}
        <PersonDetailDrawer
          request={selectedRequest}
          open={drawerOpen}
          onClose={handleDrawerClose}
          onStatusUpdate={handleStatusUpdate}
          onMessageUpdate={handleMessageUpdate}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
