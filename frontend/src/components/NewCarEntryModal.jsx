import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid } from '@mui/material';
import api from '../services/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const NewCarEntryModal = ({ open, handleClose, onVisitCreated }) => {
  const [formData, setFormData] = useState({
    reg_no: '',
    make: '',
    model: '',
    year: '',
    customerName: '',
    customerPhone: '',
    complaint: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, create or find the customer
      let customer;
      try {
        const { data } = await api.get(`/customers?search=${formData.customerPhone}`);
        if (data.length > 0) {
          customer = data[0];
        } else {
          const { data: newCustomer } = await api.post('/customers', { name: formData.customerName, phone: formData.customerPhone });
          customer = newCustomer;
        }
      } catch (error) {
        const { data: newCustomer } = await api.post('/customers', { name: formData.customerName, phone: formData.customerPhone });
        customer = newCustomer;
      }


      // Then, create or find the vehicle
      let vehicle;
      try {
        const { data } = await api.get(`/vehicles?search=${formData.reg_no}`);
        if (data.length > 0) {
          vehicle = data[0];
        } else {
          const { data: newVehicle } = await api.post('/vehicles', { reg_no: formData.reg_no, make: formData.make, model: formData.model, year: parseInt(formData.year), customer_id: customer.id });
          vehicle = newVehicle;
        }
      } catch (error) {
        const { data: newVehicle } = await api.post('/vehicles', { reg_no: formData.reg_no, make: formData.make, model: formData.model, year: parseInt(formData.year), customer_id: customer.id });
        vehicle = newVehicle;
      }


      // Finally, create the visit
      const { data: newVisit } = await api.post('/visits', {
        vehicle_id: vehicle.id,
        customer_id: customer.id,
        complaint: formData.complaint,
      });

      onVisitCreated(newVisit);
      handleClose();
    } catch (error) {
      console.error('Failed to create new car entry:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          New Car Entry
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField name="reg_no" label="Registration Number" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="make" label="Make" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="model" label="Model" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="year" label="Year" type="number" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="customerName" label="Customer Name" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="customerPhone" label="Customer Phone" fullWidth required onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="complaint" label="Complaint/Issue" fullWidth required multiline rows={3} onChange={handleChange} />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create Visit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewCarEntryModal;
