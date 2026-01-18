import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Tooltip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DirectionsCar as CarIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['Receptionist', 'Manager', 'Owner/Admin', 'Mechanic'] },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', roles: ['Manager', 'Owner/Admin'] },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['Manager', 'Owner/Admin'] },
    { text: 'Roles', icon: <SecurityIcon />, path: '/roles', isSuperAdminOnly: true },
    { text: 'Branches', icon: <BusinessIcon />, path: '/branches', isSuperAdminOnly: true },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['Receptionist', 'Manager', 'Owner/Admin', 'Mechanic'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (user?.isSuperAdmin) return true;
    if (item.isSuperAdminOnly) return false;
    if (item.roles && !item.roles.includes(user?.role)) return false;
    return true;
  });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: [1] }}>
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CarIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={800} color="primary">JULES</Typography>
          </Box>
        )}
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={!open ? item.text : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={!open ? "Logout" : ""} placement="right">
            <ListItemButton
              onClick={logout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: isMobile ? 0 : drawerWidth,
            width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          }),
          ...(!open && {
            marginLeft: isMobile ? 0 : collapsedDrawerWidth,
            width: isMobile ? '100%' : `calc(100% - ${collapsedDrawerWidth}px)`,
          }),
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {typeof user?.role === 'object' ? user?.role?.name : user?.role}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? toggleDrawer : undefined}
        sx={{
          width: open ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : collapsedDrawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: '100%', overflowX: 'hidden' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
