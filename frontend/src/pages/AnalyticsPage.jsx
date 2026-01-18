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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: `${color}.lighter`, 
          color: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {subtext}
        </Typography>
      )}
    </CardContent>
    <Box sx={{ 
      position: 'absolute', 
      bottom: -15, 
      right: -15, 
      opacity: 0.05, 
      transform: 'rotate(-15deg)' 
    }}>
      <Icon sx={{ fontSize: 100 }} />
    </Box>
  </Card>
);

const AnalyticsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
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
          {/* KPI Summary Cards */}
          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Revenue" value={`Rs. ${summary?.totalRevenue?.toLocaleString() || 0}`} subtext="Gross earnings in period" icon={TrendingUp} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Visits Completed" value={summary?.deliveredCount || 0} subtext="Successfully delivered" icon={CheckCircle} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Outstanding Balance" value={`Rs. ${summary?.unpaidAmount?.toLocaleString() || 0}`} subtext="Total unpaid amount" icon={AccountBalanceWallet} color="warning" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Average Ticket" value={`Rs. ${Math.round(summary?.avgTicketSize || 0).toLocaleString()}`} subtext="Revenue per visit" icon={Receipt} color="info" />
            </Grid>
          </Grid>

          {/* Main Charts - Responsive Grid System */}
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={4}>
              {/* Row 1: Visit Traffic & Top Mechanics */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="primary" /> Visit Traffic
                  </Typography>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[3] }} />
                        <Bar dataKey="visits" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Top Mechanics</Typography>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={topMechanics} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis dataKey="mechanicName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={100} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[3] }} />
                        <Bar dataKey="revenue" fill={theme.palette.success.main} radius={[0, 6, 6, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Row 2: Performance Outlook & Operational Status */}
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Performance Outlook</Typography>
                    <Typography variant="caption" sx={{ px: 1.5, py: 0.5, bgcolor: 'primary.lighter', color: 'primary.main', borderRadius: 1, fontWeight: 700 }}>REVENUE TREND</Typography>
                  </Stack>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <AreaChart data={revenueTrend}>
                        <defs>
                          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: theme.shadows[3] }} />
                        <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} fill="url(#gradRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>Operational Status</Typography>
                  <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          innerRadius={90}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="count"
                          nameKey="status"
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
