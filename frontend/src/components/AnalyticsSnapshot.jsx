import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import api from '../services/api';

const AnalyticsSnapshot = () => {
  const [summary, setSummary] = useState({
    week: { total_visits: 0, total_revenue: 0, unpaid_amount: 0 },
    month: { total_visits: 0, total_revenue: 0, unpaid_amount: 0 },
    year: { total_visits: 0, total_revenue: 0, unpaid_amount: 0 },
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [week, month, year] = await Promise.all([
          api.get('/analytics/summary?range=week'),
          api.get('/analytics/summary?range=month'),
          api.get('/analytics/summary?range=year'),
        ]);
        setSummary({
          week: week.data,
          month: month.data,
          year: year.data,
        });
      } catch (error) {
        console.error('Failed to fetch analytics summary:', error);
      }
    };
    fetchSummary();
  }, []);

  const StatCard = ({ title, data }) => (
    <Grid item xs={12} sm={4}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography>Total Visits: {data.total_visits}</Typography>
        <Typography>Total Revenue: ${data.total_revenue.toFixed(2)}</Typography>
        <Typography>Unpaid Amount: ${data.unpaid_amount.toFixed(2)}</Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h6">Analytics Snapshot</Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <StatCard title="This Week" data={summary.week} />
        <StatCard title="This Month" data={summary.month} />
        <StatCard title="This Year" data={summary.year} />
      </Grid>
    </Box>
  );
};

export default AnalyticsSnapshot;
