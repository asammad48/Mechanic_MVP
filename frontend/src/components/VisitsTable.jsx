import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const VisitsTable = ({ visits, onRowClick }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Reg No</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Assigned Mechanic</TableCell>
            <TableCell>Total Estimate</TableCell>
            <TableCell>Payment Status</TableCell>
            <TableCell>Created Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id} hover onClick={() => onRowClick(visit.id)} sx={{ cursor: 'pointer' }}>
              <TableCell>{visit.status}</TableCell>
              <TableCell>{visit.vehicle.reg_no}</TableCell>
              <TableCell>{visit.customer.name}</TableCell>
              <TableCell>{visit.assigned_mechanic?.name || 'N/A'}</TableCell>
              <TableCell>{visit.grand_total}</TableCell>
              <TableCell>{visit.payment_status}</TableCell>
              <TableCell>{new Date(visit.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VisitsTable;
