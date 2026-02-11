import express from 'express';
import { adminController } from './admin.controller';
import { authMiddleware, requireAdmin } from '@/lib/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Doctor approvals
router.get('/approvals/pending', adminController.getPendingApprovals);
router.post('/approvals/:id/approve', adminController.approveDoctor);
router.post('/approvals/:id/reject', adminController.rejectDoctor);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management - Doctors
router.get('/doctors', adminController.getAllDoctors);
router.delete('/doctors/:id', adminController.deleteDoctor);

// User management - Patients
router.get('/patients', adminController.getAllPatients);
router.delete('/patients/:id', adminController.deletePatient);

export { router as adminRoutes };
