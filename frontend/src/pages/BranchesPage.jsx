import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../services/api';

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Branch Management
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Create Branch
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {branches.length === 0 ? (
          <Paper 
            sx={{ 
              p: 5, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No branches found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by creating your first branch to manage your workshop.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Create Branch
            </Button>
          </Paper>
        ) : (
          <Typography variant="body1">
            {branches.length} branches found. (Table view coming soon)
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default BranchesPage;
