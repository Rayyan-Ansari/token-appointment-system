"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const validators_1 = require("@/lib/validators");
class AuthController {
    async registerPatient(req, res) {
        try {
            const data = (0, validators_1.validateRequest)(validators_1.patientRegisterSchema)(req.body);
            const result = await auth_service_1.authService.registerPatient(data);
            res.status(201).json({
                success: true,
                message: 'Patient registered successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }
    async registerDoctor(req, res) {
        try {
            const data = (0, validators_1.validateRequest)(validators_1.doctorRegisterSchema)(req.body);
            const licenseFile = req.file;
            const result = await auth_service_1.authService.registerDoctor(data, licenseFile);
            res.status(201).json({
                success: true,
                message: 'Doctor registered successfully. Pending admin approval.',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }
    async loginPatient(req, res) {
        try {
            const data = (0, validators_1.validateRequest)(validators_1.loginSchema)(req.body);
            const result = await auth_service_1.authService.loginPatient(data);
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    async loginDoctor(req, res) {
        try {
            const data = (0, validators_1.validateRequest)(validators_1.loginSchema)(req.body);
            const result = await auth_service_1.authService.loginDoctor(data);
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    async loginAdmin(req, res) {
        try {
            const data = (0, validators_1.validateRequest)(validators_1.loginSchema)(req.body);
            const result = await auth_service_1.authService.loginAdmin(data);
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }
    async getMe(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const result = await auth_service_1.authService.getUserProfile(req.user.userId, req.user.role);
            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get profile'
            });
        }
    }
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const data = (0, validators_1.validateRequest)(validators_1.updateProfileSchema)(req.body);
            const result = await auth_service_1.authService.updateProfile(req.user.userId, req.user.role, data);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map