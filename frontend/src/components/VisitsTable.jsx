import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AddCircleOutline as AddVisitIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const statusColors = {
  'PENDING': 'warning',
  'IN_PROGRESS': 'info',
  'COMPLETED': 'success',
  'CANCELLED': 'error'
};

const VisitsTable = ({ visits, onRowClick }) => {
  if (visits.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No visits recorded today.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Box} sx={{ maxHeight: 600 }}>
      <Table stickyHeader aria-label="visits table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estimate</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.map((visit) => (
            <TableRow 
              key={visit.id} 
              hover 
              sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell onClick={() => onRowClick(visit.id)}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {visit.vehicle.regNo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {visit.vehicle.make} {visit.vehicle.model}
                </Typography>
              </TableCell>
              <TableCell onClick={() => onRowClick(visit.id)}>{visit.customer.name}</TableCell>
              <TableCell onClick={() => onRowClick(visit.id)}>
                <Chip 
                  label={visit.status} 
                  size="small" 
                  color={statusColors[visit.status] || 'default'}
                  variant="soft"
                  sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                />
              </TableCell>
              <TableCell onClick={() => onRowClick(visit.id)}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${(visit.grandTotal ? Number(visit.grandTotal) : 0).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell onClick={() => onRowClick(visit.id)}>
                <Chip 
                  label={visit.paymentStatus} 
                  size="small" 
                  variant="outlined"
                  color={visit.paymentStatus === 'PAID' ? 'success' : 'warning'}
                  sx={{ fontSize: '0.65rem' }}
                />
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="New Visit for Customer">
                    <IconButton size="small" color="primary" onClick={(e) => {
                      e.stopPropagation();
                      // This would trigger the new visit modal with pre-filled customer/vehicle data
                    }}>
                      <AddVisitIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" onClick={() => onRowClick(visit.id)}>
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisitsTable;
