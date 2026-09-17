import express from 'express';
import {
  getShops,
  addShop,
  approveShop,
  rejectShop,
  requestDeleteShop,
  approveDeletion
} from '../controllers/shopController.js';

const router = express.Router();

router.get('/', getShops);
router.post('/', addShop);
router.patch('/:id/approve', approveShop);
router.patch('/:id/reject', rejectShop);
router.post('/:id/request-delete', requestDeleteShop);
router.patch('/:id/approve-deletion', approveDeletion);

export default router;
