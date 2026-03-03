import { PatientRegisterInput, DoctorRegisterInput, LoginInput, UpdateProfileInput } from '@/lib/validators';
declare class AuthService {
    registerPatient(data: PatientRegisterInput): Promise<{
        user: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            address: string;
            id: bigint;
            createdAt: Date;
        };
        token: string;
    }>;
    registerDoctor(data: DoctorRegisterInput, licenseFile?: Express.Multer.File): Promise<{
        doctor: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            qualification: string;
            specialization: string;
            yearsExperience: number;
            licenseNumber: string;
            id: bigint;
            createdAt: Date;
            licenseDocumentPath: string;
            isActive: boolean;
        };
        token: string;
    }>;
    loginPatient(data: LoginInput): Promise<{
        user: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            address: string;
            id: bigint;
            createdAt: Date;
        };
        token: string;
    }>;
    loginDoctor(data: LoginInput): Promise<{
        doctor: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            qualification: string;
            specialization: string;
            yearsExperience: number;
            licenseNumber: string;
            id: bigint;
            createdAt: Date;
            licenseDocumentPath: string;
            isActive: boolean;
        };
        token: string;
    }>;
    loginAdmin(data: LoginInput): Promise<{
        admin: {
            email: string;
            fullName: string;
            id: bigint;
            createdAt: Date;
        };
        token: string;
    }>;
    getUserProfile(userId: string, role: string): Promise<{
        user: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            address: string;
            id: bigint;
            createdAt: Date;
        };
        role: "patient";
        doctor?: undefined;
        admin?: undefined;
    } | {
        doctor: {
            email: string;
            fullName: string;
            phone: string;
            dob: Date;
            sex: import(".prisma/client").$Enums.Sex;
            qualification: string;
            specialization: string;
            yearsExperience: number;
            licenseNumber: string;
            workingHoursStart: string;
            workingHoursEnd: string;
            id: bigint;
            createdAt: Date;
            licenseDocumentPath: string;
            isActive: boolean;
            approvals: {
                status: import(".prisma/client").$Enums.ApprovalStatus;
                note: string;
                reviewedAt: Date;
            }[];
        };
        role: "doctor";
        user?: undefined;
        admin?: undefined;
    } | {
        admin: {
            email: string;
            fullName: string;
            id: bigint;
            createdAt: Date;
        };
        role: "admin";
        user?: undefined;
        doctor?: undefined;
    }>;
    updateProfile(userId: string, role: string, data: UpdateProfileInput): Promise<{
        success: boolean;
    }>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map