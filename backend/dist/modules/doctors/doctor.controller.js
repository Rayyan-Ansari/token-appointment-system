"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorController = void 0;
const session_service_1 = require("./session.service");
const token_service_1 = require("../tokens/token.service");
const db_1 = require("@/lib/db");
const validators_1 = require("@/lib/validators");
class DoctorController {
    async getDoctors(req, res) {
        try {
            const query = (0, validators_1.validateRequest)(validators_1.doctorsListSchema)(req.query);
            const where = {
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
            const doctors = await db_1.prisma.doctor.findMany({
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
            const total = await db_1.prisma.doctor.count({ where });
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get doctors'
            });
        }
    }
    async getDoctorSession(req, res) {
        try {
            const doctorId = BigInt(req.params.id);
            const patientId = req.user?.role === 'patient' ? req.user.userId : undefined;
            const result = await token_service_1.tokenService.getDoctorSession(doctorId, patientId);
            res.json({
                success: true,
                message: 'Doctor session retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get doctor session'
            });
        }
    }
    async getDoctorProfile(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const doctorId = BigInt(req.user.userId);
            const doctor = await db_1.prisma.doctor.findUnique({
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get doctor profile'
            });
        }
    }
    async startSession(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const result = await session_service_1.sessionService.startSession(req.user.userId);
            res.json({
                success: true,
                message: 'Session started successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to start session'
            });
        }
    }
    async pauseSession(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const result = await session_service_1.sessionService.pauseSession(req.user.userId);
            res.json({
                success: true,
                message: 'Session paused successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to pause session'
            });
        }
    }
    async resumeSession(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const result = await session_service_1.sessionService.resumeSession(req.user.userId);
            res.json({
                success: true,
                message: 'Session resumed successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to resume session'
            });
        }
    }
    async nextToken(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const result = await session_service_1.sessionService.nextToken(req.user.userId);
            res.json({
                success: true,
                message: 'Next token called successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to call next token'
            });
        }
    }
    async endSession(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const result = await session_service_1.sessionService.endSession(req.user.userId);
            res.json({
                success: true,
                message: 'Session ended successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to end session'
            });
        }
    }
    async getSessionAnalytics(req, res) {
        try {
            if (!req.user || req.user.role !== 'doctor') {
                return res.status(401).json({
                    success: false,
                    message: 'Doctor authentication required'
                });
            }
            const query = (0, validators_1.validateRequest)(validators_1.sessionAnalyticsSchema)(req.query);
            const result = await session_service_1.sessionService.getSessionAnalytics(req.user.userId, query.range || 'today');
            res.json({
                success: true,
                message: 'Session analytics retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get session analytics'
            });
        }
    }
}
exports.doctorController = new DoctorController();
//# sourceMappingURL=doctor.controller.js.map