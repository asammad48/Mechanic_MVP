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
  Person as PersonIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import VisitsTable from '../components/VisitsTable';
import NewCarEntryModal from '../components/NewCarEntryModal';
import VisitDetailsPanel from '../components/VisitDetailsPanel';
import AnalyticsSnapshot from '../components/AnalyticsSnapshot';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', width: '100%' }}>
        <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                JULES MECHANIC
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} alignItems="center">
              {!isMobile && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.role?.name}</Typography>
                  </Box>
                </Stack>
              )}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={logout} 
                startIcon={<LogoutIcon />}
                color="inherit"
                sx={{ borderColor: 'divider' }}
              >
                Logout
              </Button>
            </Stack>
          </Toolbar>
        </Box>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenModal} 
            startIcon={<AddIcon />}
            size={isMobile ? "medium" : "large"}
            sx={{ boxShadow: theme.shadows[4] }}
          >
            New Car Entry
          </Button>
        </Box>

        <NewCarEntryModal
          open={isModalOpen}
          handleClose={handleCloseModal}
          onVisitCreated={handleVisitCreated}
        />

        <Box sx={{ mb: 4 }}>
          <AnalyticsSnapshot />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Today's Visits</Typography>
              </Box>
              <Box sx={{ p: 0 }}>
                <VisitsTable visits={visits} onRowClick={handleRowClick} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Visit Details</Typography>
              <VisitDetailsPanel visitId={selectedVisitId} onUpdate={handleVisitUpdate} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;
