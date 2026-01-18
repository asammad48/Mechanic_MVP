import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Container,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
  Button,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LockReset as ResetIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NewUserModal from '../components/NewUserModal';
import EditUserModal from '../components/EditUserModal';
import ResetPasswordModal from '../components/ResetPasswordModal';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isAdmin = currentUser?.isSuperAdmin || (typeof currentUser?.role === 'object' ? currentUser?.role?.name : currentUser?.role) === 'Owner/Admin';
      const [usersRes, branchesRes] = await Promise.all([
        api.get('/users'),
        isAdmin ? api.get('/branches') : Promise.resolve({ data: [] })
      ]);
      setUsers(usersRes.data);
      if (isAdmin) {
        setBranches(branchesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleUserCreated = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleResetClick = (user) => {
    setSelectedUser(user);
    setIsResetModalOpen(true);
  };

  const userRole = typeof currentUser?.role === 'object' ? currentUser?.role?.name : currentUser?.role;
  const canCreateUser = currentUser?.isSuperAdmin || userRole === 'Manager' || userRole === 'Owner/Admin';

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
    const matchesBranch = branchFilter === 'all' || user.branchId === branchFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesBranch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Users Management</Typography>
        {canCreateUser && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ px: 3 }}
          >
            Create User
          </Button>
        )}
      </Box>

      <NewUserModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
        currentUser={currentUser}
        branches={branches}
      />

      <EditUserModal
        open={isEditModalOpen}
        handleClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        currentUser={currentUser}
        userToEdit={selectedUser}
        branches={branches}
      />

      <ResetPasswordModal
        open={isResetModalOpen}
        handleClose={() => {
            setIsResetModalOpen(false);
            setSelectedUser(null);
        }}
        userToReset={selectedUser}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search name or email..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="Owner/Admin">Owner/Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Receptionist">Receptionist</MenuItem>
              <MenuItem value="Mechanic">Mechanic</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {currentUser?.isSuperAdmin && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={branchFilter}
                label="Branch"
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <MenuItem value="all">All Branches</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    {search || roleFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all'
                      ? 'No users found matching filters'
                      : 'No users available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={typeof user.role === 'object' ? user.role?.name : (user.role || 'N/A')} 
                      size="small" 
                      variant="outlined" 
                      color={(typeof user.role === 'object' ? user.role?.name : user.role) === 'Owner/Admin' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{typeof user.branch === 'object' ? user.branch?.name : (user.branch || 'N/A')}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditClick(user)}
                        title="Edit User"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleResetClick(user)}
                        title="Reset Password"
                        color="warning"
                      >
                        <ResetIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UsersPage;
