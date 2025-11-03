import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestSuccess from '@/components/RequestSuccess';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('RequestSuccess', () => {
  it('renders tracking code', () => {
    render(<RequestSuccess trackingCode="TEST1234" />);
    
    expect(screen.getByText('Request Submitted Successfully!')).toBeInTheDocument();
    expect(screen.getByText('TEST1234')).toBeInTheDocument();
  });

  it('copies tracking code to clipboard', async () => {
    const user = userEvent.setup();
    
    // Mock clipboard API
    const writeTextMock = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<RequestSuccess trackingCode="TEST1234" />);
    
    const copyButton = screen.getByRole('button', { name: /copy tracking code/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('TEST1234');
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });

  it('displays success message and next steps', () => {
    render(<RequestSuccess trackingCode="TEST1234" />);
    
    expect(screen.getByText(/your request will be reviewed/i)).toBeInTheDocument();
    expect(screen.getByText(/shared with trusted community partners/i)).toBeInTheDocument();
    expect(screen.getByText(/use your tracking code/i)).toBeInTheDocument();
  });

  it('has a return to home button', () => {
    render(<RequestSuccess trackingCode="TEST1234" />);
    
    const homeButton = screen.getByRole('button', { name: /return to home/i });
    expect(homeButton).toBeInTheDocument();
  });
});
