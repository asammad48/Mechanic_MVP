import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar, 
  Container,
  Avatar,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon, 
  Logout as LogoutIcon, 
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Download as DownloadIcon,
  BarChart as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import VisitsTable from '../components/VisitsTable';
import NewCarEntryModal from '../components/NewCarEntryModal';
import VisitDetailsModal from '../components/VisitDetailsModal';
import AnalyticsSnapshot from '../components/AnalyticsSnapshot';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visits, setVisits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState(null);

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

  const handleOpenModal = (data = null) => {
    setPrefilledData(data);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPrefilledData(null);
  };

  const handleVisitCreated = (newVisit) => {
    setVisits([newVisit, ...visits]);
  };

  const handleRowClick = (visitId) => {
    setSelectedVisitId(visitId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVisitId(null);
  };

  const handleVisitUpdate = (updatedVisit) => {
    setVisits(visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/visits/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visits_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export visits:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
      <Container maxWidth={false} sx={{ mb: 4, px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/analytics')}
              startIcon={<AnalyticsIcon />}
              size={isMobile ? "medium" : "large"}
            >
              Analytics
            </Button>
            <Button 
              variant="outlined"
              onClick={handleExport}
              startIcon={<DownloadIcon />}
              size={isMobile ? "medium" : "large"}
            >
              Export Report
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOpenModal} 
              startIcon={<AddIcon />}
              size={isMobile ? "medium" : "large"}
              sx={{ 
                bgcolor: 'primary.main',
                px: 3,
                py: 1.2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              New Car Entry
            </Button>
          </Stack>
        </Box>

        <NewCarEntryModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          onVisitCreated={handleVisitCreated}
          prefilledData={prefilledData}
        />

        <VisitDetailsModal
          open={isDetailsModalOpen}
          handleClose={handleCloseDetailsModal}
          visitId={selectedVisitId}
          onUpdate={handleVisitUpdate}
        />

        <Box sx={{ mb: 4 }}>
          <AnalyticsSnapshot />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Today's Visits</Typography>
              </Box>
              <Box sx={{ p: 0 }}>
                <VisitsTable visits={visits} onRowClick={handleRowClick} onNewVisitClick={handleOpenModal} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
