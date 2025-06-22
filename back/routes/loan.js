// filepath: backend/routes/loan.js
import express from 'express';
import {
  getLoanTypes,
  applyLoan,
  getPendingLoans,
  processLoan
} from '../controllers/loanController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.get('/loan-types', getLoanTypes);
router.post('/user/apply-loan', authenticateToken, applyLoan);
router.get('/staff/loans/pending', authenticateToken, getPendingLoans);
router.post('/staff/loans/:id/process', authenticateToken, processLoan);

export default router;