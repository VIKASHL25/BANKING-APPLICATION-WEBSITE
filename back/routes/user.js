import express from 'express';
import {
  getCurrentUser,
  getAccount,
  getTransactions,
  deposit,
  withdraw,
  transfer
} from '../controllers/userController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getCurrentUser);
router.get('/account', authenticateToken, getAccount);
router.get('/transactions', authenticateToken, getTransactions);
router.post('/deposit', authenticateToken, deposit);
router.post('/withdraw', authenticateToken, withdraw);
router.post('/transfer', authenticateToken, transfer);

export default router;