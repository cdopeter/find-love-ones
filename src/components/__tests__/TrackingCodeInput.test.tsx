import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackingCodeInput from '@/components/TrackingCodeInput';

describe('TrackingCodeInput', () => {
  it('renders tracking code input form', () => {
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Track Your Request')).toBeInTheDocument();
    expect(screen.getByLabelText(/tracking number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /track request/i })
    ).toBeInTheDocument();
  });

  it('validates that at least one field is provided', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        /please provide either a tracking number or email address/i
      )
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates minimum length for tracking code', async () => {
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

  it('validates alphanumeric characters for tracking code', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const input = screen.getByLabelText(/tracking number/i);
    await user.type(input, 'ABC-1234!');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(
      await screen.findByText(
        /tracking number must be at least 8 characters and contain only letters and numbers/i
      )
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

    expect(mockOnSubmit).toHaveBeenCalledWith({ trackingCode: 'ABC12345' });
  });

  it('submits valid email address', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'notanemail');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    // Form should not submit with invalid email
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits both tracking code and email when both are provided', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<TrackingCodeInput onSubmit={mockOnSubmit} />);

    const trackingInput = screen.getByLabelText(/tracking number/i);
    const emailInput = screen.getByLabelText(/email address/i);

    await user.type(trackingInput, 'abc12345');
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /track request/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      trackingCode: 'ABC12345',
      email: 'test@example.com',
    });
  });
});
