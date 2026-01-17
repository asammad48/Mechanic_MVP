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
  Box
} from '@mui/material';

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
            <TableCell sx={{ fontWeight: 700 }} align="right">Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.map((visit) => (
            <TableRow 
              key={visit.id} 
              hover 
              onClick={() => onRowClick(visit.id)} 
              sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {visit.vehicle.reg_no}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {visit.vehicle.make} {visit.vehicle.model}
                </Typography>
              </TableCell>
              <TableCell>{visit.customer.name}</TableCell>
              <TableCell>
                <Chip 
                  label={visit.status} 
                  size="small" 
                  color={statusColors[visit.status] || 'default'}
                  variant="soft"
                  sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${visit.grand_total.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={visit.payment_status} 
                  size="small" 
                  variant="outlined"
                  color={visit.payment_status === 'PAID' ? 'success' : 'warning'}
                  sx={{ fontSize: '0.65rem' }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">
                  {new Date(visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisitsTable;
