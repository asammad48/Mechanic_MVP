import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Divider, List, ListItem, ListItemText, Paper, Stack } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

const VisitDetailsPanel = ({ visitId, onUpdate }) => {
  const [visit, setVisit] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Item states
  const [laborForm, setLaborForm] = useState({ title: '', hours: '', ratePerHour: '' });
  const [partForm, setPartForm] = useState({ name: '', qty: '', unitPrice: '' });
  const [outsideForm, setOutsideForm] = useState({ vendorName: '', workDescription: '', cost: '', notes: '' });

  const fetchVisit = async () => {
    try {
      const { data } = await api.get(`/visits/${visitId}`);
      setVisit(data);
      setFormData({
        status: data.status,
        complaint: data.complaint,
        assigned_mechanic_id: data.assigned_mechanic_id || '',
      });
    } catch (error) {
      console.error('Failed to fetch visit details:', error);
    }
  };

  useEffect(() => {
    if (visitId) {
      fetchVisit();
    }
  }, [visitId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: updatedVisit } = await api.patch(`/visits/${visitId}`, formData);
      onUpdate(updatedVisit);
      setVisit(updatedVisit);
    } catch (error) {
      console.error('Failed to update visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (type, data) => {
    setLoading(true);
    try {
      const endpoint = type === 'labor' ? `/visits/${visitId}/labor-items` : type === 'part' ? `/visits/${visitId}/part-items` : `/visits/${visitId}/outside-work-items`;
      
      // Ensure numeric values are numbers, not strings
      const payload = { ...data };
      if (type === 'labor') {
        payload.hours = Number(payload.hours);
        payload.ratePerHour = Number(payload.ratePerHour);
      } else if (type === 'part') {
        payload.qty = Number(payload.qty);
        payload.unitPrice = Number(payload.unitPrice);
      } else if (type === 'outside') {
        payload.cost = Number(payload.cost);
      }

      await api.post(endpoint, payload);
      await fetchVisit(); // Refresh visit to get updated items and totals
      
      // Reset relevant form
      if (type === 'labor') setLaborForm({ title: '', hours: '', ratePerHour: '' });
      else if (type === 'part') setPartForm({ name: '', qty: '', unitPrice: '' });
      else if (type === 'outside') setOutsideForm({ vendorName: '', workDescription: '', cost: '', notes: '' });
    } catch (error) {
      console.error(`Failed to add ${type} item:`, error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('JULES MECHANIC', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Professional Auto Repair Services', pageWidth / 2, 26, { align: 'center' });
    doc.line(20, 30, pageWidth - 20, 30);

    // Visit Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT / JOB CARD', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Receipt No: ${visit.id.substring(0, 8).toUpperCase()}`, 20, 48);
    doc.text(`Date: ${new Date(visit.createdAt).toLocaleDateString()}`, 20, 53);
    doc.text(`Status: ${visit.status}`, 20, 58);

    // Customer & Vehicle Info
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', 20, 70);
    doc.text('Vehicle Information', pageWidth / 2 + 10, 70);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Name: ${visit.customer.name}`, 20, 76);
    doc.text(`Phone: ${visit.customer.phone}`, 20, 81);
    
    doc.text(`Reg No: ${visit.vehicle.regNo}`, pageWidth / 2 + 10, 76);
    doc.text(`Make/Model: ${visit.vehicle.make} ${visit.vehicle.model}`, pageWidth / 2 + 10, 81);
    doc.text(`Mileage: ${visit.mileage} km`, pageWidth / 2 + 10, 86);

    let currentY = 100;

    // Items Table
    const tableData = [];
    
    visit.laborItems?.forEach(item => {
      tableData.push([item.title, 'Labor', '-', '-', `Rs. ${item.subtotal}`]);
    });
    
    visit.partItems?.forEach(item => {
      tableData.push([item.name, 'Part', item.qty, item.unitPrice, `Rs. ${item.subtotal}`]);
    });
    
    visit.outsideItems?.forEach(item => {
      tableData.push([item.vendorName + ' (Outside)', 'Work', '-', '-', `Rs. ${item.cost}`]);
    });

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Description', 'Type', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] }
      });
      currentY = doc.lastAutoTable.finalY + 10;
    } else {
      doc.text('No service items recorded.', 20, currentY);
      currentY += 10;
    }

    // Totals
    const rightAlignX = pageWidth - 20;
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: Rs. ${visit.grandTotal}`, rightAlignX, currentY, { align: 'right' });
    doc.text(`Paid Amount: Rs. ${visit.paidAmount}`, rightAlignX, currentY + 7, { align: 'right' });
    doc.setTextColor(220, 0, 0);
    doc.text(`Balance Due: Rs. ${visit.dueAmount}`, rightAlignX, currentY + 14, { align: 'right' });
    
    // Footer
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text('Thank you for choosing Jules Mechanic!', pageWidth / 2, pageWidth > 250 ? 280 : 270, { align: 'center' });
    doc.text('This is a computer generated receipt.', pageWidth / 2, pageWidth > 250 ? 285 : 275, { align: 'center' });

    doc.save(`receipt_${visit.id.substring(0, 8)}.pdf`);
  };

  if (!visit) {
    return <Typography>Select a visit to see details</Typography>;
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Visit Details</Typography>
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />} 
          onClick={generatePDF}
          size="small"
        >
          Print Receipt
        </Button>
      </Stack>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status || ''} label="Status" onChange={handleChange}>
                <MenuItem value="CREATED">Created</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="WAITING_PARTS">Waiting for Parts</MenuItem>
                <MenuItem value="READY">Ready for Pickup</MenuItem>
                <MenuItem value="DELIVERED">Delivered</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField name="complaint" label="Complaint" fullWidth multiline rows={3} value={formData.complaint || ''} onChange={handleChange} />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Updating...' : 'Update Visit'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Labor Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">Labor</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={5}><TextField label="Title" size="small" fullWidth value={laborForm.title} onChange={(e) => setLaborForm({...laborForm, title: e.target.value})} /></Grid>
          <Grid item xs={2}><TextField label="Hrs" size="small" type="number" fullWidth value={laborForm.hours} onChange={(e) => setLaborForm({...laborForm, hours: e.target.value})} /></Grid>
          <Grid item xs={3}><TextField label="Rate" size="small" type="number" fullWidth value={laborForm.ratePerHour} onChange={(e) => setLaborForm({...laborForm, ratePerHour: e.target.value})} /></Grid>
          <Grid item xs={2}><Button variant="outlined" size="small" fullWidth onClick={() => handleAddItem('labor', laborForm)} disabled={loading || !laborForm.title}>Add</Button></Grid>
        </Grid>
        <List dense>
          {visit.laborItems?.length === 0 && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No labor items added.</Typography>}
          {visit.laborItems?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={item.title} secondary={`${item.hours} hrs @ ${item.ratePerHour}/hr`} />
              <Typography variant="body2">${item.subtotal}</Typography>
            </ListItem>
          ))}
          {visit.laborItems?.length > 0 && (
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">Labor Subtotal: ${visit.subtotalLabor}</Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Spare Parts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">Spare Parts</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={5}><TextField label="Part Name" size="small" fullWidth value={partForm.name} onChange={(e) => setPartForm({...partForm, name: e.target.value})} /></Grid>
          <Grid item xs={2}><TextField label="Qty" size="small" type="number" fullWidth value={partForm.qty} onChange={(e) => setPartForm({...partForm, qty: e.target.value})} /></Grid>
          <Grid item xs={3}><TextField label="Price" size="small" type="number" fullWidth value={partForm.unitPrice} onChange={(e) => setPartForm({...partForm, unitPrice: e.target.value})} /></Grid>
          <Grid item xs={2}><Button variant="outlined" size="small" fullWidth onClick={() => handleAddItem('part', partForm)} disabled={loading || !partForm.name}>Add</Button></Grid>
        </Grid>
        <List dense>
          {visit.partItems?.length === 0 && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No spare parts added.</Typography>}
          {visit.partItems?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={item.name} secondary={`Qty: ${item.qty} @ ${item.unitPrice}`} />
              <Typography variant="body2">${item.subtotal}</Typography>
            </ListItem>
          ))}
          {visit.partItems?.length > 0 && (
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">Parts Subtotal: ${visit.subtotalParts}</Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Outside Workshop Work Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold">Outside Workshop Work</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={12}><TextField label="Vendor Name" size="small" fullWidth value={outsideForm.vendorName} onChange={(e) => setOutsideForm({...outsideForm, vendorName: e.target.value})} /></Grid>
          <Grid item xs={8}><TextField label="Work Description" size="small" fullWidth value={outsideForm.workDescription} onChange={(e) => setOutsideForm({...outsideForm, workDescription: e.target.value})} /></Grid>
          <Grid item xs={4}><TextField label="Cost" size="small" type="number" fullWidth value={outsideForm.cost} onChange={(e) => setOutsideForm({...outsideForm, cost: e.target.value})} /></Grid>
          <Grid item xs={12}><TextField label="Notes" size="small" fullWidth value={outsideForm.notes} onChange={(e) => setOutsideForm({...outsideForm, notes: e.target.value})} /></Grid>
          <Grid item xs={12} sx={{ mt: 1 }}><Button variant="outlined" size="small" fullWidth onClick={() => handleAddItem('outside', outsideForm)} disabled={loading || !outsideForm.vendorName}>Add Outside Work</Button></Grid>
        </Grid>
        <List dense>
          {visit.outsideItems?.length === 0 && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No outside work items added.</Typography>}
          {visit.outsideItems?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText primary={item.vendorName} secondary={item.workDescription} />
              <Typography variant="body2">${item.cost}</Typography>
            </ListItem>
          ))}
          {visit.outsideItems?.length > 0 && (
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Typography variant="body2" fontWeight="bold">Outside Subtotal: ${visit.subtotalOutside}</Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Totals Panel */}
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>Financial Summary</Typography>
        <Grid container spacing={1}>
          <Grid item xs={8}><Typography variant="body2">Labor Subtotal:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="body2">${visit.subtotalLabor}</Typography></Grid>
          
          <Grid item xs={8}><Typography variant="body2">Parts Subtotal:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="body2">${visit.subtotalParts}</Typography></Grid>
          
          <Grid item xs={8}><Typography variant="body2">Outside Work Subtotal:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="body2">${visit.subtotalOutside}</Typography></Grid>
          
          <Grid item xs={12}><Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} /></Grid>
          
          <Grid item xs={8}><Typography variant="subtitle1" fontWeight="bold">Grand Total:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="subtitle1" fontWeight="bold">${visit.grandTotal}</Typography></Grid>
          
          <Grid item xs={8}><Typography variant="body2">Paid Amount:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="body2">${visit.paidAmount}</Typography></Grid>
          
          <Grid item xs={8}><Typography variant="subtitle2" color="inherit">Due Amount:</Typography></Grid>
          <Grid item xs={4} textAlign="right"><Typography variant="subtitle2" color="inherit">${visit.dueAmount}</Typography></Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VisitDetailsPanel;
