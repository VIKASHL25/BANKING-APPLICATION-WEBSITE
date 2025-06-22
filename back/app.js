import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import staffRoutes from './routes/staff.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import loanRoutes from './routes/loan.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', loanRoutes);
app.use('/api/staff', staffRoutes);

export default app;