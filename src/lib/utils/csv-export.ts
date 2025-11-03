import { MissingPersonRequest } from '@/lib/types/database';
import Papa from 'papaparse';

/**
 * Export missing person requests to CSV
 */
export function exportToCSV(requests: MissingPersonRequest[]) {
  // Prepare data for CSV export
  const csvData = requests.map((request) => ({
    'ID': request.id || '',
    'First Name': request.first_name,
    'Last Name': request.last_name,
    'Age': request.age || '',
    'Description': request.description || '',
    'Parish': request.parish,
    'Last Seen Location': request.last_seen_location,
    'Last Seen Date': request.last_seen_date || '',
    'Status': request.status,
    'Contact Name': request.contact_name,
    'Contact Phone': request.contact_phone || '',
    'Contact Email': request.contact_email || '',
    'Notes': request.notes || '',
    'Message from Found': request.message_from_found || '',
    'Created At': request.created_at || '',
    'Updated At': request.updated_at || '',
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
