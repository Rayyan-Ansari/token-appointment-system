import express from 'express';
import { doctorController } from './doctor.controller';
import { authMiddleware, requireDoctor } from '@/lib/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/', doctorController.getDoctors);
router.get('/:id/session', doctorController.getDoctorSession);

// Protected doctor routes
router.use(authMiddleware);
router.use(requireDoctor);

// Doctor profile
router.get('/me', doctorController.getDoctorProfile);

// Session management
router.post('/session/start', doctorController.startSession);
router.post('/session/pause', doctorController.pauseSession);
router.post('/session/resume', doctorController.resumeSession);
router.post('/session/next', doctorController.nextToken);
router.post('/session/end', doctorController.endSession);

// Analytics
router.get('/session/analytics', doctorController.getSessionAnalytics);

export { router as doctorRoutes };