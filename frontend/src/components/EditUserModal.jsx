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
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../services/api';

const EditUserModal = ({ open, handleClose, onUserUpdated, currentUser, userToEdit, branches }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    branchId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (open && userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        role: userToEdit.role || '',
        branchId: userToEdit.branchId || '',
        isActive: userToEdit.isActive !== undefined ? userToEdit.isActive : true
      });
      setError(null);
      setValidationErrors({});
    }
  }, [open, userToEdit]);

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.role) errors.role = 'Role is required';
    if (currentUser?.isSuperAdmin && !formData.branchId) errors.branchId = 'Branch is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!formData.isActive && userToEdit.isActive && !window.confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) {
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(`/users/${userToEdit.id}`, formData);
      onUserUpdated(data);
      handleClose();
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
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
                {currentUser?.isSuperAdmin && <MenuItem value="Super Admin">Super Admin</MenuItem>}
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

            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                  color="primary"
                />
              }
              label={formData.isActive ? "User is Active" : "User is Inactive"}
            />
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
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserModal;
