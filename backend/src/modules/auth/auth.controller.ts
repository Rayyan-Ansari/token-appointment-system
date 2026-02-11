import { Request, Response } from 'express';
import { AuthRequest } from '@/lib/auth';
import { authService } from './auth.service';
import { 
  validateRequest, 
  patientRegisterSchema, 
  doctorRegisterSchema, 
  loginSchema 
} from '@/lib/validators';

class AuthController {
  // Patient registration
  async registerPatient(req: Request, res: Response) {
    try {
      const data = validateRequest(patientRegisterSchema)(req.body);
      const result = await authService.registerPatient(data);
      
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  // Doctor registration
  async registerDoctor(req: Request, res: Response) {
    try {
      const data = validateRequest(doctorRegisterSchema)(req.body);
      const licenseFile = req.file;
      
      const result = await authService.registerDoctor(data, licenseFile);
      
      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully. Pending admin approval.',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  // Patient login
  async loginPatient(req: Request, res: Response) {
    try {
      const data = validateRequest(loginSchema)(req.body);
      const result = await authService.loginPatient(data);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // Doctor login
  async loginDoctor(req: Request, res: Response) {
    try {
      const data = validateRequest(loginSchema)(req.body);
      const result = await authService.loginDoctor(data);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // Admin login
  async loginAdmin(req: Request, res: Response) {
    try {
      const data = validateRequest(loginSchema)(req.body);
      const result = await authService.loginAdmin(data);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  }

  // Get user profile
  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await authService.getUserProfile(req.user.userId, req.user.role);
      
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get profile'
      });
    }
  }
}

export const authController = new AuthController();