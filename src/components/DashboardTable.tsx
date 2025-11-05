'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Chip,
  Box,
  IconButton,
  TablePagination,
  TextField,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { MissingPersonRequest, RequestStatus } from '@/lib/types/database';
import { useState } from 'react';

interface DashboardTableProps {
  requests: MissingPersonRequest[];
  onStatusUpdate: (id: string, status: RequestStatus) => void;
  onRowClick: (request: MissingPersonRequest) => void;
}

const columnHelper = createColumnHelper<MissingPersonRequest>();

export default function DashboardTable({
  requests,
  onStatusUpdate,
  onRowClick,
}: DashboardTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('target_first_name', {
        header: 'First Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('target_last_name', {
        header: 'Last Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('parish', {
        header: 'Parish',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('last_known_address', {
        header: 'Last Known Address',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const row = info.row.original;
          if (!row.id) return <Chip label="Unknown" size="small" />;
          return (
            <Select
              value={info.getValue()}
              onChange={(e) => {
                e.stopPropagation();
                if (row.id) {
                  onStatusUpdate(row.id, e.target.value as RequestStatus);
                }
              }}
              size="small"
              sx={{ minWidth: 120 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem value="open">
                <Chip label="Open" color="warning" size="small" />
              </MenuItem>
              <MenuItem value="closed">
                <Chip label="Closed" color="success" size="small" />
              </MenuItem>
            </Select>
          );
        },
      }),
      columnHelper.accessor(
        (row) => `${row.requester_first_name} ${row.requester_last_name}`,
        {
          id: 'requester_name',
          header: 'Requester',
          cell: (info) => info.getValue(),
        }
      ),
      columnHelper.accessor('created_at', {
        header: 'Reported',
        cell: (info) => {
          const date = info.getValue();
          return date ? new Date(date).toLocaleDateString() : 'N/A';
        },
      }),
    ],
    [onStatusUpdate]
  );

  const table = useReactTable({
    data: requests,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, parish, or location..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort()
                        ? 'pointer'
                        : 'default',
                      fontWeight: 'bold',
                      backgroundColor: 'action.hover',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <IconButton size="small">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUpward fontSize="small" />
                          ) : (
                            <ArrowDownward fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onRowClick(row.original)}
                sx={{ cursor: 'pointer' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={table.getFilteredRowModel().rows.length}
        page={pagination.pageIndex}
        onPageChange={(_, page) =>
          setPagination((prev) => ({ ...prev, pageIndex: page }))
        }
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(e) =>
          setPagination((prev) => ({
            ...prev,
            pageSize: parseInt(e.target.value, 10),
            pageIndex: 0,
          }))
        }
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
