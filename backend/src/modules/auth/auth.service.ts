import { prisma } from '@/lib/db';
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import {
  PatientRegisterInput,
  DoctorRegisterInput,
  LoginInput,
  UpdateProfileInput
} from '@/lib/validators';
import path from 'path';
import fs from 'fs/promises';

class AuthService {
  // Patient registration
  async registerPatient(data: PatientRegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
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

    // Generate token
    const token = generateToken({
      userId: user.id.toString(),
      role: 'patient',
      email: user.email
    });

    return {
      user,
      token
    };
  }

  // Doctor registration
  async registerDoctor(data: DoctorRegisterInput, licenseFile?: Express.Multer.File) {
    // Check if doctor already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email: data.email }
    });

    if (existingDoctor) {
      throw new Error('Doctor with this email already exists');
    }

    // Handle license file upload
    let licenseDocumentPath: string | null = null;
    if (licenseFile) {
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const licensesDir = path.join(uploadDir, 'licenses');

      // Ensure directory exists
      await fs.mkdir(licensesDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(licenseFile.originalname);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
      const filePath = path.join(licensesDir, filename);

      // Save file
      await fs.writeFile(filePath, licenseFile.buffer);
      licenseDocumentPath = `licenses/${filename}`;
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create doctor and approval record in transaction
    const result = await prisma.$transaction(async (tx) => {
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

      // Create approval record
      await tx.doctorApproval.create({
        data: {
          doctorId: doctor.id,
          status: 'PENDING'
        }
      });

      return doctor;
    });

    // Generate token (but doctor won't be able to use protected routes until approved)
    const token = generateToken({
      userId: result.id.toString(),
      role: 'doctor',
      email: result.email
    });

    return {
      doctor: result,
      token
    };
  }

  // Patient login
  async loginPatient(data: LoginInput) {
    const user = await prisma.user.findUnique({
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

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    console.log('Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch for user:', user.email);
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
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

  // Doctor login
  async loginDoctor(data: LoginInput) {
    const doctor = await prisma.doctor.findUnique({
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

    const isPasswordValid = await comparePassword(data.password, doctor.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
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

  // Admin login
  async loginAdmin(data: LoginInput) {
    const admin = await prisma.admin.findUnique({
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

    const isPasswordValid = await comparePassword(data.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
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

  // Get user profile
  async getUserProfile(userId: string, role: string) {
    const id = BigInt(userId);

    switch (role) {
      case 'patient':
        const user = await prisma.user.findUnique({
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

        if (!user) throw new Error('User not found');
        return { user, role };

      case 'doctor':
        const doctor = await prisma.doctor.findUnique({
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

        if (!doctor) throw new Error('Doctor not found');
        return { doctor, role };

      case 'admin':
        const admin = await prisma.admin.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true
          }
        });

        if (!admin) throw new Error('Admin not found');
        return { admin, role };

      default:
        throw new Error('Invalid role');
    }
  }

  // Update user profile
  async updateProfile(userId: string, role: string, data: UpdateProfileInput) {
    const id = BigInt(userId);
    let currentRecord: any = null;

    // Fetch the current user based on role to get the old passwordHash if needed
    if (role === 'patient') {
      currentRecord = await prisma.user.findUnique({ where: { id } });
    } else if (role === 'doctor') {
      currentRecord = await prisma.doctor.findUnique({ where: { id } });
    } else {
      throw new Error('Profile updates only supported for patients and doctors');
    }

    if (!currentRecord) throw new Error('User not found');

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (role === 'doctor') {
      if (data.workingHoursStart !== undefined) updateData.workingHoursStart = data.workingHoursStart;
      if (data.workingHoursEnd !== undefined) updateData.workingHoursEnd = data.workingHoursEnd;
    }

    // Password validation and update
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new Error('Current password is required to set a new password');
      }

      const isPasswordValid = await comparePassword(data.currentPassword, currentRecord.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      updateData.passwordHash = await hashPassword(data.newPassword);
    }

    if (role === 'patient') {
      await prisma.user.update({
        where: { id },
        data: updateData
      });
    } else if (role === 'doctor') {
      await prisma.doctor.update({
        where: { id },
        data: updateData
      });
    }

    return { success: true };
  }
}

export const authService = new AuthService();