import express from 'express';
import {
  getServices,
  getServiceById,
  addService,
  updateService,
  toggleService,
  deleteService,
  uploadServiceIcon
} from '../controllers/serviceController.js';
import { serviceIconUpload } from '../middlewares/uploadMiddleware.js';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Icon Upload Endpoint (Protected: Admin/Manager)
router.post('/upload-icon', authenticateToken, authorizeRoles('super_admin', 'sub_admin', 'manager'), serviceIconUpload.single('icon'), uploadServiceIcon);

// Read Endpoints (Protected: Authenticated Users)
router.get('/', authenticateToken, getServices);
router.get('/:id', authenticateToken, getServiceById);

// Admin/Manager Mutation Endpoints (Protected: Admin/Manager Only)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'sub_admin', 'manager'), addService);
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'sub_admin', 'manager'), updateService);
router.patch('/:id/toggle', authenticateToken, authorizeRoles('super_admin', 'sub_admin', 'manager'), toggleService);
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'sub_admin', 'manager'), deleteService);

export default router;
