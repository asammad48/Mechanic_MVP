import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Divider, List, ListItem, ListItemText, Paper } from '@mui/material';
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
      const endpoint = type === 'labor' ? '/labor-items' : type === 'part' ? '/part-items' : '/outside-work-items';
      await api.post(endpoint, { ...data, visitId });
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

  if (!visit) {
    return <Typography>Select a visit to see details</Typography>;
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
      <Typography variant="h6">Visit Details</Typography>
      
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
