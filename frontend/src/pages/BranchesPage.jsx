import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const BranchesPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Branch Management
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            Branch management interface will be implemented here.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default BranchesPage;
