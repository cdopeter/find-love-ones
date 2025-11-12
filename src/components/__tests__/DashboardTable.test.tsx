import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardTable from '@/components/DashboardTable';
import { MissingPersonRequest } from '@/lib/types/database';

describe('DashboardTable', () => {
  const mockOnStatusUpdate = vi.fn();
  const mockOnRowClick = vi.fn();

  const mockRequests: MissingPersonRequest[] = [
    {
      id: '1',
      target_first_name: 'John',
      target_last_name: 'Doe',
      last_known_address: '123 Main St, Kingston',
      parish: 'Kingston',
      requester_first_name: 'Jane',
      requester_last_name: 'Smith',
      requester_email: 'jane@example.com',
      requester_phone: '876-123-4567',
      status: 'open',
      location_status: 'found',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      target_first_name: 'Alice',
      target_last_name: 'Johnson',
      last_known_address: '456 Oak Ave, Montego Bay',
      parish: 'St. James',
      requester_first_name: 'Bob',
      requester_last_name: 'Williams',
      requester_email: 'bob@example.com',
      status: 'open',
      location_status: 'missing',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      target_first_name: 'Charlie',
      target_last_name: 'Brown',
      last_known_address: '789 Pine Rd, Ocho Rios',
      parish: 'St. Ann',
      requester_first_name: 'David',
      requester_last_name: 'Davis',
      requester_email: 'david@example.com',
      status: 'closed',
      location_status: 'unknown',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  it('renders table with location status column', () => {
    render(
      <DashboardTable
        requests={mockRequests}
        onStatusUpdate={mockOnStatusUpdate}
        onRowClick={mockOnRowClick}
      />
    );

    // Check that location status header is present
    expect(screen.getByText('Location Status')).toBeInTheDocument();

    // Check that location status values are displayed with proper labels
    expect(screen.getByText('Found')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('does not display address column', () => {
    render(
      <DashboardTable
        requests={mockRequests}
        onStatusUpdate={mockOnStatusUpdate}
        onRowClick={mockOnRowClick}
      />
    );

    // Address column header should not be present
    expect(screen.queryByText('Last Known Address')).not.toBeInTheDocument();

    // Address values should not be displayed
    expect(screen.queryByText('123 Main St, Kingston')).not.toBeInTheDocument();
    expect(screen.queryByText('456 Oak Ave, Montego Bay')).not.toBeInTheDocument();
  });

  it('displays all required columns', () => {
    render(
      <DashboardTable
        requests={mockRequests}
        onStatusUpdate={mockOnStatusUpdate}
        onRowClick={mockOnRowClick}
      />
    );

    // Check for expected column headers
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Parish')).toBeInTheDocument();
    expect(screen.getByText('Location Status')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Requester')).toBeInTheDocument();
    expect(screen.getByText('Reported')).toBeInTheDocument();
  });

  it('does not display email or phone in table', () => {
    render(
      <DashboardTable
        requests={mockRequests}
        onStatusUpdate={mockOnStatusUpdate}
        onRowClick={mockOnRowClick}
      />
    );

    // Email and phone should not be displayed in the table
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('bob@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('876-123-4567')).not.toBeInTheDocument();
  });
});
