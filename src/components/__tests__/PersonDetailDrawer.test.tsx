import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonDetailDrawer from '@/components/PersonDetailDrawer';
import { MissingPersonRequest } from '@/lib/types/database';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

describe('PersonDetailDrawer', () => {
  const mockRequest: MissingPersonRequest = {
    id: '123',
    target_first_name: 'John',
    target_last_name: 'Doe',
    last_known_address: 'Kingston Downtown',
    parish: 'Kingston',
    requester_first_name: 'Jane',
    requester_last_name: 'Smith',
    requester_phone: '876-123-4567',
    requester_email: 'jane@example.com',
    message_to_person: 'Test message',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockOnClose = vi.fn();
  const mockOnMessageUpdate = vi.fn();

  it('renders person details when open', () => {
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={true}
        onClose={mockOnClose}
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    expect(screen.getByText('Person Details')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    // Address, email, and phone should not be displayed
    expect(screen.queryByText('Kingston Downtown')).not.toBeInTheDocument();
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('876-123-4567')).not.toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PersonDetailDrawer
        request={mockRequest}
        open={false}
        onClose={mockOnClose}
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
        onMessageUpdate={mockOnMessageUpdate}
      />
    );

    // The IconButton with CloseIcon
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons[0]; // First button is the close button
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
