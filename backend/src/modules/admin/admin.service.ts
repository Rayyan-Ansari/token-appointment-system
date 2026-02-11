import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const adminService = {
    // Get pending doctor approvals
    async getPendingApprovals() {
        const pendingDoctors = await prisma.doctor.findMany({
            where: {
                isActive: false
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                specialization: true,
                qualification: true,
                yearsExperience: true,
                licenseNumber: true,
                licenseDocumentPath: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return pendingDoctors.map(doctor => ({
            id: doctor.id.toString(), // Approvals ID can be same as Doctor ID for simplicity
            doctorId: doctor.id.toString(),
            doctor: {
                fullName: doctor.fullName,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                qualification: doctor.qualification,
                yearsExperience: doctor.yearsExperience,
                licenseNumber: doctor.licenseNumber,
                licenseDocumentPath: doctor.licenseDocumentPath
            },
            status: 'PENDING',
            createdAt: doctor.createdAt
        }));
    },

    // Approve a doctor
    async approveDoctor(doctorId: string) {
        const doctorIdBigInt = BigInt(doctorId);

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        if (doctor.isActive) {
            throw new Error('Doctor is already active');
        }

        // Update doctor status to active
        await prisma.doctor.update({
            where: { id: doctorIdBigInt },
            data: { isActive: true }
        });

        return { success: true };
    },

    // Reject a doctor
    async rejectDoctor(doctorId: string) {
        const doctorIdBigInt = BigInt(doctorId);

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        // Delete the doctor record
        await prisma.doctor.delete({
            where: { id: doctorIdBigInt }
        });

        return { success: true };
    },

    // Get dashboard statistics
    async getDashboardStats() {
        const [activeDoctors, pendingApprovals, totalPatients] = await Promise.all([
            prisma.doctor.count({ where: { isActive: true } }),
            prisma.doctor.count({ where: { isActive: false } }),
            prisma.user.count()
        ]);

        return {
            activeDoctors,
            pendingApprovals,
            totalPatients
        };
    },

    // Get all active doctors
    async getAllDoctors() {
        const doctors = await prisma.doctor.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                specialization: true,
                qualification: true,
                yearsExperience: true,
                licenseNumber: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return doctors.map(doctor => ({
            ...doctor,
            id: doctor.id.toString()
        }));
    },

    // Delete a doctor
    async deleteDoctor(doctorId: string) {
        const doctorIdBigInt = BigInt(doctorId);

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        // Delete associated sessions first (cascade)
        await prisma.session.deleteMany({
            where: { doctorId: doctorIdBigInt }
        });

        // Delete the doctor
        await prisma.doctor.delete({
            where: { id: doctorIdBigInt }
        });

        return { success: true };
    },

    // Get all patients
    async getAllPatients() {
        const patients = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return patients.map(patient => ({
            ...patient,
            id: patient.id.toString()
        }));
    },

    // Delete a patient
    async deletePatient(patientId: string) {
        const patientIdBigInt = BigInt(patientId);

        // Check if patient exists
        const patient = await prisma.user.findUnique({
            where: { id: patientIdBigInt }
        });

        if (!patient) {
            throw new Error('Patient not found');
        }

        // Delete associated tokens first (cascade)
        await prisma.token.deleteMany({
            where: { patientId: patientIdBigInt }
        });

        // Delete the patient
        await prisma.user.delete({
            where: { id: patientIdBigInt }
        });

        return { success: true };
    }
};
