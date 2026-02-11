import { Request, Response } from 'express';
import { adminService } from './admin.service';

export const adminController = {
    // Get pending doctor approvals
    async getPendingApprovals(req: Request, res: Response) {
        try {
            const result = await adminService.getPendingApprovals();
            res.json({
                success: true,
                message: 'Pending approvals retrieved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get pending approvals'
            });
        }
    },

    // Approve a doctor
    async approveDoctor(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await adminService.approveDoctor(id);
            res.json({
                success: true,
                message: 'Doctor approved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to approve doctor'
            });
        }
    },

    // Reject a doctor
    async rejectDoctor(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await adminService.rejectDoctor(id);
            res.json({
                success: true,
                message: 'Doctor rejected successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reject doctor'
            });
        }
    },

    // Get dashboard statistics
    async getDashboardStats(req: Request, res: Response) {
        try {
            const result = await adminService.getDashboardStats();
            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get dashboard statistics'
            });
        }
    },

    // Get all doctors
    async getAllDoctors(req: Request, res: Response) {
        try {
            const result = await adminService.getAllDoctors();
            res.json({
                success: true,
                message: 'Doctors retrieved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get doctors'
            });
        }
    },

    // Delete a doctor
    async deleteDoctor(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await adminService.deleteDoctor(id);
            res.json({
                success: true,
                message: 'Doctor deleted successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete doctor'
            });
        }
    },

    // Get all patients
    async getAllPatients(req: Request, res: Response) {
        try {
            const result = await adminService.getAllPatients();
            res.json({
                success: true,
                message: 'Patients retrieved successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get patients'
            });
        }
    },

    // Delete a patient
    async deletePatient(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await adminService.deletePatient(id);
            res.json({
                success: true,
                message: 'Patient deleted successfully',
                data: result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete patient'
            });
        }
    }
};
