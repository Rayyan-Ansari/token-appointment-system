"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.adminService = {
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
            id: doctor.id.toString(),
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
    async approveDoctor(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        if (doctor.isActive) {
            throw new Error('Doctor is already active');
        }
        await prisma.doctor.update({
            where: { id: doctorIdBigInt },
            data: { isActive: true }
        });
        return { success: true };
    },
    async rejectDoctor(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        await prisma.doctor.delete({
            where: { id: doctorIdBigInt }
        });
        return { success: true };
    },
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
                dob: true,
                sex: true,
                specialization: true,
                qualification: true,
                yearsExperience: true,
                licenseNumber: true,
                licenseDocumentPath: true,
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
    async deleteDoctor(doctorId) {
        const doctorIdBigInt = BigInt(doctorId);
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorIdBigInt }
        });
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        await prisma.session.deleteMany({
            where: { doctorId: doctorIdBigInt }
        });
        await prisma.doctor.delete({
            where: { id: doctorIdBigInt }
        });
        return { success: true };
    },
    async getAllPatients() {
        const patients = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                dob: true,
                sex: true,
                address: true,
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
    async deletePatient(patientId) {
        const patientIdBigInt = BigInt(patientId);
        const patient = await prisma.user.findUnique({
            where: { id: patientIdBigInt }
        });
        if (!patient) {
            throw new Error('Patient not found');
        }
        await prisma.token.deleteMany({
            where: { patientId: patientIdBigInt }
        });
        await prisma.user.delete({
            where: { id: patientIdBigInt }
        });
        return { success: true };
    },
    async getAllTokens() {
        const tokens = await prisma.token.findMany({
            include: {
                patient: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                    }
                },
                session: {
                    include: {
                        doctor: {
                            select: {
                                fullName: true,
                                specialization: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                bookedAt: 'desc'
            }
        });
        return tokens.map(token => ({
            id: token.id.toString(),
            tokenNo: token.tokenNo,
            status: token.status,
            bookedAt: token.bookedAt,
            calledAt: token.calledAt,
            servedAt: token.servedAt,
            canceledAt: token.canceledAt,
            noShowAt: token.noShowAt,
            patient: {
                id: token.patientId.toString(),
                fullName: token.patient.fullName,
                email: token.patient.email,
                phone: token.patient.phone,
            },
            doctor: {
                id: token.session.doctorId.toString(),
                fullName: token.session.doctor.fullName,
                specialization: token.session.doctor.specialization,
            },
            session: {
                id: token.session.id.toString(),
                sessionDate: token.session.sessionDate,
                status: token.session.status,
                currentTokenNo: token.session.currentTokenNo,
                maxTokenNo: token.session.maxTokenNo,
            }
        }));
    }
};
//# sourceMappingURL=admin.service.js.map