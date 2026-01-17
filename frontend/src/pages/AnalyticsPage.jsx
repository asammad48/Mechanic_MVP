import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, Button, 
  ButtonGroup, TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert
} from '@mui/material';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsPage = () => {
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
      const params = { range, dateFrom, dateTo, branchId, allBranches };
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
    setRange('');
    fetchData();
  };

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      
      {/* Filters Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <ButtonGroup variant="outlined" size="small">
                {['7d', '30d', '90d', '12m'].map(r => (
                  <Button 
                    key={r} 
                    onClick={() => { setRange(r); setDateFrom(''); setDateTo(''); }}
                    variant={range === r ? 'contained' : 'outlined'}
                  >
                    {r}
                  </Button>
                ))}
              </ButtonGroup>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField 
                type="date" 
                label="From" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                fullWidth size="small" InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField 
                type="date" 
                label="To" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                fullWidth size="small" InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button variant="contained" onClick={handleManualFilter} fullWidth size="small">Apply</Button>
            </Grid>

            {user?.isSuperAdmin && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={allBranches === 'true' ? 'all' : branchId}
                    label="Branch"
                    onChange={(e) => {
                      if (e.target.value === 'all') {
                        setAllBranches('true');
                        setBranchId('');
                      } else {
                        setAllBranches('false');
                        setBranchId(e.target.value);
                      }
                    }}
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
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">Total Revenue</Typography>
                  <Typography variant="h5">PKR {summary?.totalRevenue?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">Delivered Visits</Typography>
                  <Typography variant="h5">{summary?.deliveredCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">Unpaid Amount</Typography>
                  <Typography variant="h5">PKR {summary?.unpaidAmount?.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="overline">Avg Ticket Size</Typography>
                  <Typography variant="h5">PKR {Math.round(summary?.avgTicketSize || 0).toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Revenue Trend */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue & Unpaid Trend</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                        <Area type="monotone" dataKey="unpaid" stroke="#ff7300" fill="#ff7300" name="Unpaid" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Breakdown */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Status Breakdown</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusBreakdown}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Visits Trend */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Visits Trend</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visits" fill="#82ca9d" name="Visits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Mechanics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Mechanics by Revenue</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMechanics} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="mechanicName" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name="Revenue (PKR)" />
                      </BarChart>
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
