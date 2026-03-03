"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const db_1 = require("@/lib/db");
const auth_1 = require("@/lib/auth");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class AuthService {
    async registerPatient(data) {
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const passwordHash = await (0, auth_1.hashPassword)(data.password);
        const user = await db_1.prisma.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                phone: data.phone,
                dob: data.dob,
                sex: data.sex,
                address: data.address,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                dob: true,
                sex: true,
                address: true,
                createdAt: true
            }
        });
        const token = (0, auth_1.generateToken)({
            userId: user.id.toString(),
            role: 'patient',
            email: user.email
        });
        return {
            user,
            token
        };
    }
    async registerDoctor(data, licenseFile) {
        const existingDoctor = await db_1.prisma.doctor.findUnique({
            where: { email: data.email }
        });
        if (existingDoctor) {
            throw new Error('Doctor with this email already exists');
        }
        let licenseDocumentPath = null;
        if (licenseFile) {
            const uploadDir = process.env.UPLOAD_DIR || 'uploads';
            const licensesDir = path_1.default.join(uploadDir, 'licenses');
            await promises_1.default.mkdir(licensesDir, { recursive: true });
            const fileExtension = path_1.default.extname(licenseFile.originalname);
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
            const filePath = path_1.default.join(licensesDir, filename);
            await promises_1.default.writeFile(filePath, licenseFile.buffer);
            licenseDocumentPath = `licenses/${filename}`;
        }
        const passwordHash = await (0, auth_1.hashPassword)(data.password);
        const result = await db_1.prisma.$transaction(async (tx) => {
            const doctor = await tx.doctor.create({
                data: {
                    email: data.email,
                    fullName: data.fullName,
                    phone: data.phone,
                    dob: data.dob,
                    sex: data.sex,
                    qualification: data.qualification,
                    specialization: data.specialization,
                    yearsExperience: data.yearsExperience,
                    licenseNumber: data.licenseNumber,
                    passwordHash,
                    licenseDocumentPath,
                },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    phone: true,
                    dob: true,
                    sex: true,
                    qualification: true,
                    specialization: true,
                    yearsExperience: true,
                    licenseNumber: true,
                    licenseDocumentPath: true,
                    isActive: true,
                    createdAt: true
                }
            });
            await tx.doctorApproval.create({
                data: {
                    doctorId: doctor.id,
                    status: 'PENDING'
                }
            });
            return doctor;
        });
        const token = (0, auth_1.generateToken)({
            userId: result.id.toString(),
            role: 'doctor',
            email: result.email
        });
        return {
            doctor: result,
            token
        };
    }
    async loginPatient(data) {
        const user = await db_1.prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                fullName: true,
                phone: true,
                dob: true,
                sex: true,
                address: true,
                createdAt: true
            }
        });
        if (!user) {
            console.log('❌ User not found:', data.email);
            throw new Error('Invalid email or password');
        }
        console.log('✅ User found:', user.email);
        console.log('🔑 Comparing passwords...');
        console.log('Input password length:', data.password.length);
        console.log('Stored hash:', user.passwordHash.substring(0, 20) + '...');
        const isPasswordValid = await (0, auth_1.comparePassword)(data.password, user.passwordHash);
        console.log('Password valid?', isPasswordValid);
        if (!isPasswordValid) {
            console.log('❌ Password mismatch for user:', user.email);
            throw new Error('Invalid email or password');
        }
        const token = (0, auth_1.generateToken)({
            userId: user.id.toString(),
            role: 'patient',
            email: user.email
        });
        const { passwordHash, ...userData } = user;
        return {
            user: userData,
            token
        };
    }
    async loginDoctor(data) {
        const doctor = await db_1.prisma.doctor.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                fullName: true,
                phone: true,
                dob: true,
                sex: true,
                qualification: true,
                specialization: true,
                yearsExperience: true,
                licenseNumber: true,
                licenseDocumentPath: true,
                isActive: true,
                createdAt: true
            }
        });
        if (!doctor) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(data.password, doctor.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = (0, auth_1.generateToken)({
            userId: doctor.id.toString(),
            role: 'doctor',
            email: doctor.email
        });
        const { passwordHash, ...doctorData } = doctor;
        return {
            doctor: doctorData,
            token
        };
    }
    async loginAdmin(data) {
        const admin = await db_1.prisma.admin.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                fullName: true,
                createdAt: true
            }
        });
        if (!admin) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(data.password, admin.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = (0, auth_1.generateToken)({
            userId: admin.id.toString(),
            role: 'admin',
            email: admin.email
        });
        const { passwordHash, ...adminData } = admin;
        return {
            admin: adminData,
            token
        };
    }
    async getUserProfile(userId, role) {
        const id = BigInt(userId);
        switch (role) {
            case 'patient':
                const user = await db_1.prisma.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        phone: true,
                        dob: true,
                        sex: true,
                        address: true,
                        createdAt: true
                    }
                });
                if (!user)
                    throw new Error('User not found');
                return { user, role };
            case 'doctor':
                const doctor = await db_1.prisma.doctor.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        phone: true,
                        dob: true,
                        sex: true,
                        qualification: true,
                        specialization: true,
                        yearsExperience: true,
                        licenseNumber: true,
                        licenseDocumentPath: true,
                        isActive: true,
                        workingHoursStart: true,
                        workingHoursEnd: true,
                        createdAt: true,
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
                if (!doctor)
                    throw new Error('Doctor not found');
                return { doctor, role };
            case 'admin':
                const admin = await db_1.prisma.admin.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        createdAt: true
                    }
                });
                if (!admin)
                    throw new Error('Admin not found');
                return { admin, role };
            default:
                throw new Error('Invalid role');
        }
    }
    async updateProfile(userId, role, data) {
        const id = BigInt(userId);
        let currentRecord = null;
        if (role === 'patient') {
            currentRecord = await db_1.prisma.user.findUnique({ where: { id } });
        }
        else if (role === 'doctor') {
            currentRecord = await db_1.prisma.doctor.findUnique({ where: { id } });
        }
        else {
            throw new Error('Profile updates only supported for patients and doctors');
        }
        if (!currentRecord)
            throw new Error('User not found');
        const updateData = {};
        if (data.fullName)
            updateData.fullName = data.fullName;
        if (data.email)
            updateData.email = data.email;
        if (data.phone)
            updateData.phone = data.phone;
        if (role === 'doctor') {
            if (data.workingHoursStart !== undefined)
                updateData.workingHoursStart = data.workingHoursStart;
            if (data.workingHoursEnd !== undefined)
                updateData.workingHoursEnd = data.workingHoursEnd;
        }
        if (data.newPassword) {
            if (!data.currentPassword) {
                throw new Error('Current password is required to set a new password');
            }
            const isPasswordValid = await (0, auth_1.comparePassword)(data.currentPassword, currentRecord.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            updateData.passwordHash = await (0, auth_1.hashPassword)(data.newPassword);
        }
        if (role === 'patient') {
            await db_1.prisma.user.update({
                where: { id },
                data: updateData
            });
        }
        else if (role === 'doctor') {
            await db_1.prisma.doctor.update({
                where: { id },
                data: updateData
            });
        }
        return { success: true };
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map