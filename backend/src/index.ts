import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/users.routes';
import customerRoutes from './customers/customers.routes';
import vehicleRoutes from './vehicles/vehicles.routes';
import visitRoutes from './visits/visits.routes';
import analyticsRoutes from './analytics/analytics.routes';
import branchRoutes from './branches/branches.routes';

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: DATABASE_URL and JWT_SECRET must be defined.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/customers', customerRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/visits', visitRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/branches', branchRoutes);
import laborItemRoutes from './labor-items/labor-items.routes';
import partItemRoutes from './part-items/part-items.routes';
import outsideWorkItemRoutes from './outside-work-items/outside-work-items.routes';
app.use('/labor-items', laborItemRoutes);
app.use('/part-items', partItemRoutes);
app.use('/outside-work-items', outsideWorkItemRoutes);

app.get('/', (req, res) => {
  res.send('Jules Mechanic API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
