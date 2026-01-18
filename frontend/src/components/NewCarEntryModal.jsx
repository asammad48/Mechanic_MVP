import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

const NewCarEntryModal = ({ open, handleClose, onVisitCreated, prefilledData }) => {
  const [formData, setFormData] = useState({
    reg_no: '',
    make: '',
    model: '',
    year: '',
    customerName: '',
    customerPhone: '',
    complaint: '',
    mileage: '',
  });

  useEffect(() => {
    if (open && prefilledData) {
      setFormData(prev => ({
        ...prev,
        ...prefilledData,
        complaint: '', // Usually new visit needs new complaint
        mileage: '',   // Usually needs updated mileage
      }));
    } else if (open && !prefilledData) {
      setFormData({
        reg_no: '',
        make: '',
        model: '',
        year: '',
        customerName: '',
        customerPhone: '',
        complaint: '',
        mileage: '',
      });
    }
  }, [open, prefilledData]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.reg_no) newErrors.reg_no = 'Registration Number is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.mileage) newErrors.mileage = 'Mileage is required';
    if (!formData.complaint) newErrors.complaint = 'Complaint is required';
    if (!formData.customerName && !formData.customerPhone) {
      newErrors.customer = 'Either Customer Name or Phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    try {
      // First, create or find the customer and vehicle
      let customer;
      let vehicle;
      
      try {
        // Send everything in one request to the new transactional endpoint
        const { data: result } = await api.post('/customers', {
          name: formData.customerName || 'Walk-in Customer',
          phone: formData.customerPhone || '0000000000',
          vehicle: {
            regNo: formData.reg_no,
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year)
          }
        });
        customer = result.customer;
        vehicle = result.vehicle;
      } catch (error) {
        console.error('Failed to create customer/vehicle:', error);
        throw error;
      }

      // Finally, create the visit
      const { data: newVisit } = await api.post('/visits', {
        vehicle_id: vehicle.id,
        customer_id: customer.id,
        complaint: formData.complaint,
        mileage: parseInt(formData.mileage),
      });

      onVisitCreated(newVisit);
      handleClose();
    } catch (error) {
      console.error('Failed to create new car entry:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            New Car Entry
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {apiError && (
          <Typography color="error" sx={{ mt: 2, p: 1, border: '1px solid', borderColor: 'error.main', borderRadius: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
            {apiError}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField name="reg_no" label="Registration Number" fullWidth required error={!!errors.reg_no} helperText={errors.reg_no} value={formData.reg_no} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="make" label="Make" fullWidth required error={!!errors.make} helperText={errors.make} value={formData.make} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="model" label="Model" fullWidth required error={!!errors.model} helperText={errors.model} value={formData.model} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="year" label="Year" type="number" fullWidth required error={!!errors.year} helperText={errors.year} value={formData.year} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="mileage" label="Mileage" type="number" fullWidth required error={!!errors.mileage} helperText={errors.mileage} value={formData.mileage} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="customerName" label="Customer Name" fullWidth error={!!errors.customer} helperText={errors.customer} value={formData.customerName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="customerPhone" label="Customer Phone" fullWidth error={!!errors.customer} helperText={errors.customer} value={formData.customerPhone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="complaint" label="Complaint/Issue" fullWidth required multiline rows={3} error={!!errors.complaint} helperText={errors.complaint} value={formData.complaint} onChange={handleChange} />
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
