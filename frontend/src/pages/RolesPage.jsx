import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Container,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import api from '../services/api';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const coreRoles = ['Owner/Admin', 'Manager', 'Mechanic', 'Receptionist'];

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/roles');
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError('Failed to load roles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      setModalError('Role name is required');
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      await api.post('/roles', { name: roleName });
      setRoleName('');
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Roles Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Create Role
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No roles found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const isCore = coreRoles.includes(role.name);
                return (
                  <TableRow key={role.id || role.name} hover>
                    <TableCell>{role.name}</TableCell>
                    <TableCell align="right">
                      {isCore ? (
                        <Tooltip title="Core roles cannot be modified">
                          <IconButton size="small" disabled>
                            <LockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Role</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {modalError && <Alert severity="error">{modalError}</Alert>}
            <TextField
              label="Role Name"
              fullWidth
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={modalLoading}
              required
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} disabled={modalLoading}>Cancel</Button>
          <Button
            onClick={handleCreateRole}
            variant="contained"
            disabled={modalLoading}
            startIcon={modalLoading && <CircularProgress size={20} />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RolesPage;
