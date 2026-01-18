import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../services/api';

const NewUserModal = ({ open, handleClose, onUserCreated, currentUser, branches }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Mechanic',
    branchId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Mechanic',
        branchId: currentUser?.isSuperAdmin ? '' : (currentUser?.branchId || '')
      });
      setError(null);
      setValidationErrors({});
    }
  }, [open, currentUser]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.role) errors.role = 'Role is required';
    if (currentUser?.isSuperAdmin && !formData.branchId) errors.branchId = 'Branch is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData };
      // If not super admin, branchId is already set from current user or handled by backend
      const { data } = await api.post('/users', payload);
      onUserCreated(data);
      handleClose();
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              name="name"
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              disabled={loading}
              required
            />

            <TextField
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
              required
            />

            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
              required
              autoComplete="new-password"
            />

            <FormControl fullWidth error={!!validationErrors.role} required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="Owner/Admin">Owner/Admin</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Mechanic">Mechanic</MenuItem>
              </Select>
            </FormControl>

            {currentUser?.isSuperAdmin && (
              <FormControl fullWidth error={!!validationErrors.branchId} required>
                <InputLabel>Branch</InputLabel>
                <Select
                  name="branchId"
                  value={formData.branchId}
                  label="Branch"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Create User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewUserModal;
