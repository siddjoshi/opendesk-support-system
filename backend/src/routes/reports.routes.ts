import express from 'express';
import {
  getDashboardStats,
  getTicketTrends,
  getAgentPerformance,
  getPriorityDistribution,
  getStatusDistribution,
  getSLACompliance,
  exportReportsCSV
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Ticket trends
router.get('/trends', getTicketTrends);

// Agent performance
router.get('/agent-performance', getAgentPerformance);

// Priority distribution
router.get('/priority-distribution', getPriorityDistribution);

// Status distribution
router.get('/status-distribution', getStatusDistribution);

// SLA compliance
router.get('/sla-compliance', getSLACompliance);

// Export CSV
router.get('/export/csv', exportReportsCSV);

export default router;