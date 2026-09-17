import express from 'express';
import {
  getServices,
  addService,
  toggleService
} from '../controllers/serviceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', authenticateToken, addService);
router.patch('/:id/toggle', authenticateToken, toggleService);

export default router;
