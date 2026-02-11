import express from 'express';
import { tokenController } from './token.controller';
import { authMiddleware, requirePatient } from '@/lib/auth';

const router = express.Router();

// All token routes require patient authentication
router.use(authMiddleware);
router.use(requirePatient);

// Book a token
router.post('/book', tokenController.bookToken);

// Get patient's tokens
router.get('/my', tokenController.getMyTokens);

export { router as tokenRoutes };