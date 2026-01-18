import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import api from '../services/api';

const ResetPasswordModal = ({ open, handleClose, userToReset }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.patch(`/users/${userToReset.id}/reset-password`, { password });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to reset password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Reset Password</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Resetting password for: <strong>{userToReset?.name} ({userToReset?.email})</strong>
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Password reset successfully!</Alert>}
            
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Reset Password
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResetPasswordModal;
