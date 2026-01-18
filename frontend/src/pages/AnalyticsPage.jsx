import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, Button, 
  ButtonGroup, TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Stack, useTheme, Paper
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  TrendingUp,
  AccountBalanceWallet,
  CheckCircle,
  Receipt,
  FilterList,
  CalendarToday
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <Card 
    elevation={0} 
    sx={{ 
      height: '100%', 
      borderRadius: '20px', 
      background: '#fff',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        borderColor: `${color}.light`
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
        <Box sx={{ 
          p: 1.25, 
          borderRadius: '12px', 
          bgcolor: `${color}.lighter`, 
          color: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `inset 0 0 0 1px ${theme => theme.palette[color].light}20`
        }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.025em' }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', letterSpacing: '-0.025em' }}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: `${color}.main` }} />
          {subtext}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  // ... rest of state stays same
  const [range, setRange] = useState('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [allBranches, setAllBranches] = useState(user?.isSuperAdmin ? 'true' : 'false');
  
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [topMechanics, setTopMechanics] = useState([]);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      api.get('/users/branches').then(res => setBranches(res.data)).catch(console.error);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { range: range || '30d', dateFrom, dateTo, branchId, allBranches };
      const [sumRes, trendRes, statusRes, mechRes] = await Promise.all([
        api.get('/analytics/summary', { params }),
        api.get('/analytics/revenue-trend', { params }),
        api.get('/analytics/status-breakdown', { params }),
        api.get('/analytics/top-mechanics', { params }),
      ]);
      
      setSummary(sumRes.data);
      setRevenueTrend(trendRes.data);
      setStatusBreakdown(statusRes.data);
      setTopMechanics(mechRes.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, branchId, allBranches]);

  const handleManualFilter = () => {
    if (!dateFrom || !dateTo) return;
    setRange('');
    fetchData();
  };

  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: 'auto', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>Analytics Dashboard</Typography>
          <Typography variant="subtitle1" color="text.secondary">Comprehensive business performance overview</Typography>
        </Box>
        <Button startIcon={<FilterList />} variant="contained" size="large" sx={{ borderRadius: 2, px: 3 }}>
          Export Report
        </Button>
      </Stack>
      
      {/* Filters Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} lg={4}>
            <Box sx={{ bgcolor: 'action.hover', p: 0.75, borderRadius: 2.5, display: 'flex', width: 'fit-content' }}>
              {['7d', '30d', '90d', '12m'].map(r => (
                <Button 
                  key={r} 
                  onClick={() => { setRange(r); setDateFrom(''); setDateTo(''); }}
                  variant={range === r ? 'contained' : 'text'}
                  size="small"
                  sx={{ 
                    minWidth: 70,
                    borderRadius: 2,
                    textTransform: 'uppercase',
                    fontWeight: range === r ? 700 : 500,
                    boxShadow: range === r ? 2 : 0,
                    color: range === r ? 'primary.contrastText' : 'text.secondary'
                  }}
                >
                  {r}
                </Button>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4} lg={2}>
            <TextField 
              type="date" 
              label="From" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
              fullWidth size="small" 
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4} lg={2}>
            <TextField 
              type="date" 
              label="To" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
              fullWidth size="small" 
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4} lg={1}>
            <Button 
              variant="contained" 
              onClick={handleManualFilter} 
              fullWidth 
              disabled={!dateFrom || !dateTo}
              sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
            >
              Apply
            </Button>
          </Grid>

          {user?.isSuperAdmin && (
            <Grid item xs={12} lg={3}>
              <FormControl fullWidth size="small">
                <InputLabel>View Branch</InputLabel>
                <Select
                  value={allBranches === 'true' ? 'all' : branchId}
                  label="View Branch"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setAllBranches('true');
                      setBranchId('');
                    } else {
                      setAllBranches('false');
                      setBranchId(e.target.value);
                    }
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Branches</MenuItem>
                  {branches.map(b => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={15} gap={3}>
          <CircularProgress thickness={4} size={60} />
          <Typography color="text.secondary" variant="h6" fontWeight={500}>Generating Insights...</Typography>
        </Box>
      ) : (
        <>
            {/* Card 1: Total Visits with Daily Trend */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '24px', 
                  border: '1px solid #f1f5f9', 
                  height: '100%',
                  background: '#fff',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'primary.lighter', color: 'primary.main', display: 'flex' }}>
                      <CalendarToday sx={{ fontSize: 18 }} />
                    </Box>
                    Daily Visits
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.025em' }}>
                    {summary?.totalVisits || 0}
                  </Typography>
                </Stack>
                
                <Box sx={{ width: '100%', height: 280, mt: 2 }}>
                  <ResponsiveContainer>
                    <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.15}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visits" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorVisits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Card 2: Revenue Collection (Paid vs Unpaid) */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3.5, 
                  borderRadius: '24px', 
                  border: '1px solid #f1f5f9', 
                  height: '100%',
                  background: '#fff',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'success.lighter', color: 'success.main', display: 'flex' }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                  </Box>
                  Revenue Collection
                </Typography>
                
                <Box sx={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart 
                      data={[
                        { name: 'Paid', amount: summary?.paid_amount || 0, color: '#10b981' },
                        { name: 'Unpaid', amount: summary?.unpaid_amount || 0, color: '#f59e0b' }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={60}>
                        {
                          [
                            { color: '#10b981' },
                            { color: '#f59e0b' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                
                <Stack direction="row" spacing={3} justifyContent="center" mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Paid: Rs. {summary?.paid_amount?.toLocaleString() || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Unpaid: Rs. {summary?.unpaid_amount?.toLocaleString() || 0}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
