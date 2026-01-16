import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import VisitsTable from '../components/VisitsTable';
import NewCarEntryModal from '../components/NewCarEntryModal';
import VisitDetailsPanel from '../components/VisitDetailsPanel';
import AnalyticsSnapshot from '../components/AnalyticsSnapshot';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [visits, setVisits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);

  const fetchVisits = async () => {
    try {
      const { data } = await api.get('/visits');
      setVisits(data);
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleVisitCreated = (newVisit) => {
    setVisits([newVisit, ...visits]);
  };

  const handleRowClick = (visitId) => {
    setSelectedVisitId(visitId);
  };

  const handleVisitUpdate = (updatedVisit) => {
    setVisits(visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Jules Mechanic Dashboard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ mr: 2 }}>{user?.name} ({user?.role?.name})</Typography>
          <Button variant="contained" onClick={logout}>Logout</Button>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={handleOpenModal}>
          New Car Entry
        </Button>
      </Box>

      <NewCarEntryModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        onVisitCreated={handleVisitCreated}
      />

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Today's Visits */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Today's Visits</Typography>
            <VisitsTable visits={visits} onRowClick={handleRowClick} />
          </Paper>
        </Grid>

        {/* Create / Edit Visit */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <VisitDetailsPanel visitId={selectedVisitId} onUpdate={handleVisitUpdate} />
          </Paper>
        </Grid>

        {/* Analytics Snapshot */}
        <Grid item xs={12}>
          <AnalyticsSnapshot />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
