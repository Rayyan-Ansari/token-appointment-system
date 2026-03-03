"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("./admin.service");
exports.adminController = {
    async getPendingApprovals(req, res) {
        try {
            const result = await admin_service_1.adminService.getPendingApprovals();
            res.json({
                success: true,
                message: 'Pending approvals retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get pending approvals'
            });
        }
    },
    async approveDoctor(req, res) {
        try {
            const { id } = req.params;
            const result = await admin_service_1.adminService.approveDoctor(id);
            res.json({
                success: true,
                message: 'Doctor approved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to approve doctor'
            });
        }
    },
    async rejectDoctor(req, res) {
        try {
            const { id } = req.params;
            const result = await admin_service_1.adminService.rejectDoctor(id);
            res.json({
                success: true,
                message: 'Doctor rejected successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reject doctor'
            });
        }
    },
    async getDashboardStats(req, res) {
        try {
            const result = await admin_service_1.adminService.getDashboardStats();
            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get dashboard statistics'
            });
        }
    },
    async getAllDoctors(req, res) {
        try {
            const result = await admin_service_1.adminService.getAllDoctors();
            res.json({
                success: true,
                message: 'Doctors retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get doctors'
            });
        }
    },
    async deleteDoctor(req, res) {
        try {
            const { id } = req.params;
            const result = await admin_service_1.adminService.deleteDoctor(id);
            res.json({
                success: true,
                message: 'Doctor deleted successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete doctor'
            });
        }
    },
    async getAllPatients(req, res) {
        try {
            const result = await admin_service_1.adminService.getAllPatients();
            res.json({
                success: true,
                message: 'Patients retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get patients'
            });
        }
    },
    async deletePatient(req, res) {
        try {
            const { id } = req.params;
            const result = await admin_service_1.adminService.deletePatient(id);
            res.json({
                success: true,
                message: 'Patient deleted successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete patient'
            });
        }
    },
    async getAllTokens(req, res) {
        try {
            const result = await admin_service_1.adminService.getAllTokens();
            res.json({
                success: true,
                message: 'Tokens retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get token transactions'
            });
        }
    }
};
//# sourceMappingURL=admin.controller.js.map