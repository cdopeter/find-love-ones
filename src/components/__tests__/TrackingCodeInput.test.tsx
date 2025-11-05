import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackingCodeInput from '@/components/TrackingCodeInput';

describe('TrackingCodeInput', () => {
  it('renders tracking code input form', () => {
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Enter Your Tracking Number')).toBeInTheDocument();
    expect(screen.getByLabelText(/tracking number/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /track request/i })
    ).toBeInTheDocument();
  });

  it('validates tracking code input', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/tracking number is required/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates minimum length', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/tracking number/i);
    await user.type(input, 'ABC');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates alphanumeric characters', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/tracking number/i);
    await user.type(input, 'ABC-1234!');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(/must contain only letters and numbers/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid tracking code in uppercase', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/tracking number/i);
    await user.type(input, 'abc12345');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('ABC12345');
  });
});
