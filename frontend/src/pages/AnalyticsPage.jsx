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
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>Analytics Dashboard</Typography>
          <Typography variant="subtitle1" color="text.secondary">Monitor your business performance and trends</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<FilterList />} variant="outlined" size="small">Export Report</Button>
        </Stack>
      </Stack>
      
      {/* Enhanced Filters Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} lg={4}>
            <Stack direction="row" spacing={1}>
              <Box sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2, display: 'flex' }}>
                {['7d', '30d', '90d', '12m'].map(r => (
                  <Button 
                    key={r} 
                    onClick={() => { setRange(r); setDateFrom(''); setDateTo(''); }}
                    variant={range === r ? 'contained' : 'text'}
                    size="small"
                    sx={{ 
                      minWidth: 60,
                      borderRadius: 1.5,
                      textTransform: 'uppercase',
                      fontWeight: range === r ? 700 : 400,
                      boxShadow: range === r ? 1 : 0
                    }}
                  >
                    {r}
                  </Button>
                ))}
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} lg={2}>
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
          <Grid item xs={12} sm={6} md={3} lg={2}>
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
          <Grid item xs={12} md={2} lg={1}>
            <Button 
              variant="contained" 
              onClick={handleManualFilter} 
              fullWidth 
              size="medium"
              disabled={!dateFrom || !dateTo}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Apply
            </Button>
          </Grid>

          {user?.isSuperAdmin && (
            <Grid item xs={12} md={4} lg={3}>
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
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10} gap={2}>
          <CircularProgress thickness={4} size={50} />
          <Typography color="text.secondary" variant="subtitle2">Analyzing data...</Typography>
        </Box>
      ) : (
        <>
          {/* Enhanced KPI Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Revenue" 
                value={`Rs. ${summary?.totalRevenue?.toLocaleString() || 0}`}
                subtext="Gross earnings in period"
                icon={TrendingUp}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Visits Completed" 
                value={summary?.deliveredCount || 0}
                subtext="Successfully delivered"
                icon={CheckCircle}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Outstanding Balance" 
                value={`Rs. ${summary?.unpaidAmount?.toLocaleString() || 0}`}
                subtext="Total unpaid amount"
                icon={AccountBalanceWallet}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Average Ticket" 
                value={`Rs. ${Math.round(summary?.avgTicketSize || 0).toLocaleString()}`}
                subtext="Revenue per visit"
                icon={Receipt}
                color="info"
              />
            </Grid>
          </Grid>

          {/* Enhanced Charts Section */}
          <Grid container spacing={3}>
            {/* Visit Traffic */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Visit Traffic</Typography>
                  <Box height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: theme.palette.action.hover }} />
                        <Bar 
                          dataKey="visits" 
                          fill={theme.palette.info.main} 
                          radius={[4, 4, 0, 0]} 
                          name="Visits" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Performing Mechanics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Top Performing Mechanics</Typography>
                  <Box height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMechanics} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis 
                          dataKey="mechanicName" 
                          type="category" 
                          width={120} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar 
                          dataKey="revenue" 
                          fill={theme.palette.secondary.main} 
                          radius={[0, 4, 4, 0]} 
                          name="Revenue (Rs.)" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Outlook (Revenue Trend) */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Performance Outlook</Typography>
                    <Typography variant="caption" color="text.secondary">Revenue vs Unpaid (Trend)</Typography>
                  </Stack>
                  <Box height={350}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorUnpaid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickFormatter={(value) => `Rs.${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: theme.shadows[3],
                            backgroundColor: theme.palette.background.paper
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={theme.palette.primary.main} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                          name="Revenue" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="unpaid" 
                          stroke={theme.palette.warning.main} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorUnpaid)" 
                          name="Outstanding" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Operational Status (Status Breakdown) */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Operational Status</Typography>
                  <Box height={350} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
