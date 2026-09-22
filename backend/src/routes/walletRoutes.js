import express from 'express';
import {
  getWalletTransactions,
  rechargeWallet,
  deductWallet,
  refundWallet
} from '../controllers/walletController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/transactions', authenticateToken, getWalletTransactions);
router.post('/recharge', authenticateToken, rechargeWallet);
router.post('/deduct', authenticateToken, deductWallet);
router.post('/refund', authenticateToken, refundWallet);

export default router;

