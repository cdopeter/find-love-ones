import { MissingPersonRequest } from '@/lib/types/database';
import Papa from 'papaparse';

/**
 * Export missing person requests to CSV
 */
export function exportToCSV(requests: MissingPersonRequest[]) {
  // Prepare data for CSV export
  const csvData = requests.map((request) => ({
    ID: request.id || '',
    'Target First Name': request.target_first_name,
    'Target Last Name': request.target_last_name,
    Parish: request.parish,
    'Last Known Address': request.last_known_address,
    Status: request.status,
    'Requester First Name': request.requester_first_name,
    'Requester Last Name': request.requester_last_name,
    'Requester Phone': request.requester_phone || '',
    'Requester Email': request.requester_email,
    'Message to Person': request.message_to_person || '',
    'Created At': request.created_at || '',
  }));

  // Convert to CSV
  const csv = Papa.unparse(csvData);

  // Create a download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `missing-persons-${timestamp}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
