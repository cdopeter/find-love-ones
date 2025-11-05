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

    // Check that we have multiple first/last name fields (target + requester)
    const firstNameInputs = screen.getAllByLabelText(/first name/i);
    const lastNameInputs = screen.getAllByLabelText(/last name/i);

    expect(firstNameInputs).toHaveLength(2); // Target and requester
    expect(lastNameInputs).toHaveLength(2); // Target and requester
    expect(screen.getByLabelText(/last known address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parish/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /submit request/i })
    ).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<RequestForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByRole('button', {
      name: /submit request/i,
    });
    await user.click(submitButton);

    // Form should not call onSuccess when required fields are empty
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<RequestForm onSuccess={mockOnSuccess} />);

    // Fill in required fields for target person
    const firstNameInputs = screen.getAllByLabelText(/first name/i);
    const lastNameInputs = screen.getAllByLabelText(/last name/i);

    await user.type(firstNameInputs[0], 'John');
    await user.type(lastNameInputs[0], 'Doe');
    await user.type(
      screen.getByLabelText(/last known address/i),
      'Kingston Downtown'
    );

    // Select parish
    const parishSelect = screen.getByLabelText(/parish/i);
    await user.click(parishSelect);
    const kingstonOption = await screen.findByRole('option', {
      name: 'Kingston',
    });
    await user.click(kingstonOption);

    // Fill in requester information
    await user.type(screen.getByLabelText(/your first name/i), 'Jane');
    await user.type(screen.getByLabelText(/your last name/i), 'Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', {
      name: /submit request/i,
    });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
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

    // Fill in required fields for target person
    const firstNameInputs = screen.getAllByLabelText(/first name/i);
    const lastNameInputs = screen.getAllByLabelText(/last name/i);

    await user.type(firstNameInputs[0], 'John');
    await user.type(lastNameInputs[0], 'Doe');
    await user.type(
      screen.getByLabelText(/last known address/i),
      'Kingston Downtown'
    );

    // Select parish
    const parishSelect = screen.getByLabelText(/parish/i);
    await user.click(parishSelect);
    const kingstonOption = await screen.findByRole('option', {
      name: 'Kingston',
    });
    await user.click(kingstonOption);

    // Fill in requester information
    await user.type(screen.getByLabelText(/your first name/i), 'Jane');
    await user.type(screen.getByLabelText(/your last name/i), 'Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Submit form
    const submitButton = screen.getByRole('button', {
      name: /submit request/i,
    });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
