import { Response } from 'express';
import { AuthRequest } from '@/lib/auth';
import { sessionService } from './session.service';
import { tokenService } from '../tokens/token.service';
import { prisma } from '@/lib/db';
import {
  validateRequest,
  doctorsListSchema,
  sessionAnalyticsSchema
} from '@/lib/validators';

class DoctorController {
  // Get approved doctors list (public)
  async getDoctors(req: AuthRequest, res: Response) {
    try {
      const query = validateRequest(doctorsListSchema)(req.query);

      const where: any = {
        isActive: query.approved === 'true',
      };

      if (query.name) {
        where.fullName = {
          contains: query.name,
          mode: 'insensitive'
        };
      }

      if (query.specialization) {
        where.specialization = {
          contains: query.specialization,
          mode: 'insensitive'
        };
      }

      if (query.minExp) {
        where.yearsExperience = {
          gte: query.minExp
        };
      }

      const doctors = await prisma.doctor.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          specialization: true,
          yearsExperience: true,
          qualification: true,
          isActive: true
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: {
          fullName: 'asc'
        }
      });

      const total = await prisma.doctor.count({ where });

      res.json({
        success: true,
        message: 'Doctors retrieved successfully',
        data: {
          doctors,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            pages: Math.ceil(total / query.limit)
          }
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get doctors'
      });
    }
  }

  // Get doctor session info (public with optional auth)
  async getDoctorSession(req: AuthRequest, res: Response) {
    try {
      const doctorId = BigInt(req.params.id);
      const patientId = req.user?.role === 'patient' ? req.user.userId : undefined;

      const result = await tokenService.getDoctorSession(doctorId, patientId);

      res.json({
        success: true,
        message: 'Doctor session retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get doctor session'
      });
    }
  }

  // Get current doctor profile
  async getDoctorProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const doctorId = BigInt(req.user.userId);
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          specialization: true,
          qualification: true,
          yearsExperience: true,
          isActive: true,
          approvals: {
            select: {
              status: true,
              note: true,
              reviewedAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
      }

      res.json({
        success: true,
        message: 'Doctor profile retrieved successfully',
        data: doctor
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get doctor profile'
      });
    }
  }

  // Start session
  async startSession(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const result = await sessionService.startSession(req.user.userId);

      res.json({
        success: true,
        message: 'Session started successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to start session'
      });
    }
  }

  // Pause session
  async pauseSession(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const result = await sessionService.pauseSession(req.user.userId);

      res.json({
        success: true,
        message: 'Session paused successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to pause session'
      });
    }
  }

  // Resume session
  async resumeSession(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const result = await sessionService.resumeSession(req.user.userId);

      res.json({
        success: true,
        message: 'Session resumed successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resume session'
      });
    }
  }

  // Call next token
  async nextToken(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const result = await sessionService.nextToken(req.user.userId);

      res.json({
        success: true,
        message: 'Next token called successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to call next token'
      });
    }
  }

  // End session
  async endSession(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const result = await sessionService.endSession(req.user.userId);

      res.json({
        success: true,
        message: 'Session ended successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to end session'
      });
    }
  }

  // Get session analytics
  async getSessionAnalytics(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'doctor') {
        return res.status(401).json({
          success: false,
          message: 'Doctor authentication required'
        });
      }

      const query = validateRequest(sessionAnalyticsSchema)(req.query);
      const result = await sessionService.getSessionAnalytics(req.user.userId, query.range || 'today');

      res.json({
        success: true,
        message: 'Session analytics retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get session analytics'
      });
    }
  }
}

export const doctorController = new DoctorController();