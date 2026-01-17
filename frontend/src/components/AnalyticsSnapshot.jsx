import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack, useTheme } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  AttachMoney as MoneyIcon, 
  EventNote as EventIcon 
} from '@mui/icons-material';
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

  const StatCard = ({ title, data, icon: Icon, color }) => (
    <Grid item xs={12} sm={4}>
      <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
          <Icon sx={{ fontSize: 100, color }} />
        </Box>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          ${data.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Typography>
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Visits</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{data.total_visits}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Unpaid</Typography>
            <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700 }}>
              ${data.unpaid_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Business Insights</Typography>
      <Grid container spacing={3}>
        <StatCard title="This Week" data={summary.week} icon={TrendingUpIcon} color="primary.main" />
        <StatCard title="This Month" data={summary.month} icon={EventIcon} color="secondary.main" />
        <StatCard title="This Year" data={summary.year} icon={MoneyIcon} color="success.main" />
      </Grid>
    </Box>
  );
};

export default AnalyticsSnapshot;
