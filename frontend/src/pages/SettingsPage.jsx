import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Switch, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  Button
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, 
  Business as BusinessIcon, 
  Security as SecurityIcon,
  Print as PrintIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const SettingsPage = () => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Settings</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ borderRadius: '20px', p: 3 }}>
              <List>
                <ListItem button selected>
                  <ListItemIcon><BusinessIcon /></ListItemIcon>
                  <ListItemText primary="Workshop Profile" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon><NotificationsIcon /></ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon><PrintIcon /></ListItemIcon>
                  <ListItemText primary="Print Templates" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon><SecurityIcon /></ListItemIcon>
                  <ListItemText primary="Security" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: '20px', p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Workshop Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">Auto-generate Invoice PDF</Typography>
                      <Typography variant="body2" color="text.secondary">Automatically generate and save a PDF copy when marking a visit as delivered.</Typography>
                    </Box>
                    <Switch defaultChecked />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">Enable SMS Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">Send automated updates to customers about their vehicle status.</Typography>
                    </Box>
                    <Switch />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<SaveIcon />}>
                  Save Changes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SettingsPage;
