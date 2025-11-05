import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackingResult from '@/components/TrackingResult';

// Mock supabase module
vi.mock('@/lib/supabase', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    rpc: vi.fn().mockReturnThis(),
  };

  return {
    supabase: mockSupabase,
  };
});

describe('TrackingResult', () => {
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', async () => {
    const { supabase } = await import('@/lib/supabase');

    (supabase.single as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<TrackingResult trackingCode="ABC12345" onReset={mockOnReset} />);

    expect(screen.getByText(/looking up your request/i)).toBeInTheDocument();
  });

  it('displays error when request not found', async () => {
    const { supabase } = await import('@/lib/supabase');

    (supabase.rpc as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    render(<TrackingResult trackingCode="ABC12345" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(
        screen.getByText(/no request found with this tracking number/i)
      ).toBeInTheDocument();
    });
  });

  it('displays request details when found', async () => {
    const { supabase } = await import('@/lib/supabase');

    const mockRequest = {
      id: 'abc12345-1234-5678-90ab-cdef12345678',
      target_first_name: 'John',
      target_last_name: 'Doe',
      status: 'open',
      last_known_address: '123 Main St',
      parish: 'Kingston',
      message_to_person: 'Please come home',
      created_at: '2025-01-01T00:00:00Z',
    };

    (supabase.rpc as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockRequest,
      error: null,
    });

    (supabase.order as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    render(<TrackingResult trackingCode="ABC12345" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/open/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St, Kingston/i)).toBeInTheDocument();
      expect(screen.getByText('Please come home')).toBeInTheDocument();
    });
  });

  it('displays found updates when available', async () => {
    const { supabase } = await import('@/lib/supabase');

    const mockRequest = {
      id: 'abc12345-1234-5678-90ab-cdef12345678',
      target_first_name: 'John',
      target_last_name: 'Doe',
      status: 'closed',
      last_known_address: '123 Main St',
      parish: 'Kingston',
      created_at: '2025-01-01T00:00:00Z',
    };

    const mockUpdates = [
      {
        id: 'update-1',
        request_id: 'abc12345-1234-5678-90ab-cdef12345678',
        message_from_found_party: 'I am safe',
        created_at: '2025-01-02T00:00:00Z',
        created_by: '00000000-0000-0000-0000-000000000000',
      },
      {
        id: 'update-2',
        request_id: 'abc12345-1234-5678-90ab-cdef12345678',
        message_from_found_party: 'With family now',
        created_at: '2025-01-03T00:00:00Z',
        created_by: '00000000-0000-0000-0000-000000000000',
      },
    ];

    (supabase.rpc as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockRequest,
      error: null,
    });

    (supabase.order as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockUpdates,
      error: null,
    });

    render(<TrackingResult trackingCode="ABC12345" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(screen.getByText('I am safe')).toBeInTheDocument();
      expect(screen.getByText('With family now')).toBeInTheDocument();
    });
  });

  it('allows user to search another tracking code', async () => {
    const { supabase } = await import('@/lib/supabase');
    const user = userEvent.setup();

    (supabase.rpc as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    render(<TrackingResult trackingCode="ABC12345" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(screen.getByText(/no request found/i)).toBeInTheDocument();
    });

    const searchAnotherButton = screen.getByRole('button', {
      name: /try another search/i,
    });
    await user.click(searchAnotherButton);

    expect(mockOnReset).toHaveBeenCalled();
  });

  it('displays error when searching by email and not found', async () => {
    const { supabase } = await import('@/lib/supabase');

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.select as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.ilike as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    render(<TrackingResult email="test@example.com" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(
        screen.getByText(/no request found with this email address/i)
      ).toBeInTheDocument();
    });
  });

  it('searches by email when provided', async () => {
    const { supabase } = await import('@/lib/supabase');

    const mockRequest = {
      id: 'abc12345-1234-5678-90ab-cdef12345678',
      target_first_name: 'Jane',
      target_last_name: 'Smith',
      status: 'open',
      last_known_address: '456 Oak St',
      parish: 'St. Andrew',
      created_at: '2025-01-01T00:00:00Z',
    };

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.select as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.ilike as ReturnType<typeof vi.fn>).mockReturnThis();
    (supabase.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockRequest,
      error: null,
    });

    (supabase.order as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    render(<TrackingResult email="test@example.com" onReset={mockOnReset} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText(/456 Oak St, St. Andrew/i)).toBeInTheDocument();
    });
  });
});
