import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestForm from '@/components/RequestForm';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '12345678-1234-1234-1234-123456789012' },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('RequestForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<RequestForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last seen location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parish/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<RequestForm onSuccess={mockOnSuccess} />);
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<RequestForm onSuccess={mockOnSuccess} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/last seen location/i), 'Kingston Downtown');
    await user.type(screen.getByLabelText(/your name/i), 'Jane Smith');

    // Select parish
    const parishSelect = screen.getByLabelText(/parish/i);
    await user.click(parishSelect);
    const kingstonOption = await screen.findByRole('option', { name: 'Kingston' });
    await user.click(kingstonOption);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays error on submission failure', async () => {
    const user = userEvent.setup();
    
    // Mock supabase to return an error
    const { supabase } = await import('@/lib/supabase');
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: { message: 'Database error' },
          })),
        })),
      })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<RequestForm onSuccess={mockOnSuccess} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/last seen location/i), 'Kingston Downtown');
    await user.type(screen.getByLabelText(/your name/i), 'Jane Smith');

    // Select parish
    const parishSelect = screen.getByLabelText(/parish/i);
    await user.click(parishSelect);
    const kingstonOption = await screen.findByRole('option', { name: 'Kingston' });
    await user.click(kingstonOption);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/database error/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
