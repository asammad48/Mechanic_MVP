import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../services/api';

const VisitDetailsPanel = ({ visitId, onUpdate }) => {
  const [visit, setVisit] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (visitId) {
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
      fetchVisit();
    }
  }, [visitId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: updatedVisit } = await api.patch(`/visits/${visitId}`, formData);
      onUpdate(updatedVisit);
      setVisit(updatedVisit);
    } catch (error) {
      console.error('Failed to update visit:', error);
    }
  };

  if (!visit) {
    return <Typography>Select a visit to see details</Typography>;
  }

  return (
    <Box>
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
          {/* Add more fields as needed, e.g., assigned mechanic */}
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Update Visit
        </Button>
      </Box>
    </Box>
  );
};

export default VisitDetailsPanel;
