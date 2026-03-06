import 'dotenv/config';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import './src/config/passport.ts';
import authRoutes from './src/routes/authRoutes.ts';
import { authenticateJWT } from './src/middleware/auth.ts';
import metadataRoutes from './src/routes/metadataRoutes.ts';
import dashboardRoutes from './src/routes/dashboardRoutes.ts';
import heatmapRoutes from './src/routes/heatmapRoutes.ts';
import analyticsRoutes from './src/routes/analyticsRoutes.ts';
import alertsRoutes from './src/routes/alertsRoutes.ts';
import searchRoutes from './src/routes/searchRoutes.ts';
import policyRoutes from "./src/routes/policyRoutes.ts";
import reportRoutes from "./src/routes/reportRoutes.ts";
import syncRoutes from "./src/routes/syncRoutes.ts";
import { ensureBucket } from './src/utils/supabaseStorage.ts';

const app = express();

// Allow PORT to be set via environment variable for Nginx load balancing
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
   origin: [
    "https://uidai-intelligence-dashboard.vercel.app",
    "https://uidai-intelligence-dashboard-kgoq.vercel.app",
    "http://localhost:3001",
    "http://localhost:3000"
  ],
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/metadata', metadataRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sync', syncRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '🚀 API is running!',
    port: PORT,
    processId: process.pid
  });
});

app.get('/api/secure', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} (PID: ${process.pid})`);

  // Initialize Supabase storage bucket (non-blocking)
  ensureBucket().catch((err) =>
    console.warn('⚠️ Supabase Storage init skipped:', err.message)
  );
});