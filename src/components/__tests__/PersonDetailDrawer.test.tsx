import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonDetailDrawer from '@/components/PersonDetailDrawer';
import { MissingPersonRequest } from '@/lib/types/database';

describe('PersonDetailDrawer', () => {
  const mockRequest: MissingPersonRequest = {
    id: '123',
    first_name: 'John',
    last_name: 'Doe',
    age: 45,
    description: 'Test description',
    last_seen_location: 'Kingston Downtown',
    last_seen_date: '2024-01-01',
    parish: 'Kingston',
    contact_name: 'Jane Smith',
    contact_phone: '876-123-4567',
    contact_email: 'jane@example.com',
    notes: 'Test notes',
    status: 'missing',
    message_from_found: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockOnClose = vi.fn();
  const mockOnStatusUpdate = vi.fn();
  const mockOnMessageUpdate = vi.fn();

  it('renders person details when open', () => {
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={true}
        onClose={mockOnClose}
        onStatusUpdate={mockOnStatusUpdate}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    expect(screen.getByText('Person Details')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Kingston Downtown')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={false}
        onClose={mockOnClose}
        onStatusUpdate={mockOnStatusUpdate}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    expect(screen.queryByText('Person Details')).not.toBeInTheDocument();
  });

  it('does not render when request is null', () => {
    render(
      <PersonDetailDrawer
        request={null}
        open={true}
        onClose={mockOnClose}
        onStatusUpdate={mockOnStatusUpdate}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    expect(screen.queryByText('Person Details')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={true}
        onClose={mockOnClose}
        onStatusUpdate={mockOnStatusUpdate}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows status update', async () => {
    const user = userEvent.setup();
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={true}
        onClose={mockOnClose}
        onStatusUpdate={mockOnStatusUpdate}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    // Find and click status select
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    
    // Select 'found' status
    const foundOption = await screen.findByRole('option', { name: /found/i });
    await user.click(foundOption);

    await waitFor(() => {
      expect(mockOnStatusUpdate).toHaveBeenCalledWith('123', 'found');
    });
  });
});
