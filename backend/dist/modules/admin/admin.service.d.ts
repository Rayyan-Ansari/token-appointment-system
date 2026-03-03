export declare const adminService: {
    getPendingApprovals(): Promise<{
        id: string;
        doctorId: string;
        doctor: {
            fullName: string;
            email: string;
            phone: string;
            specialization: string;
            qualification: string;
            yearsExperience: number;
            licenseNumber: string;
            licenseDocumentPath: string;
        };
        status: string;
        createdAt: Date;
    }[]>;
    approveDoctor(doctorId: string): Promise<{
        success: boolean;
    }>;
    rejectDoctor(doctorId: string): Promise<{
        success: boolean;
    }>;
    getDashboardStats(): Promise<{
        activeDoctors: number;
        pendingApprovals: number;
        totalPatients: number;
    }>;
    getAllDoctors(): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        dob: Date;
        sex: import(".prisma/client").$Enums.Sex;
        qualification: string;
        specialization: string;
        yearsExperience: number;
        licenseNumber: string;
        createdAt: Date;
        licenseDocumentPath: string;
    }[]>;
    deleteDoctor(doctorId: string): Promise<{
        success: boolean;
    }>;
    getAllPatients(): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        dob: Date;
        sex: import(".prisma/client").$Enums.Sex;
        address: string;
        createdAt: Date;
    }[]>;
    deletePatient(patientId: string): Promise<{
        success: boolean;
    }>;
    getAllTokens(): Promise<{
        id: string;
        tokenNo: number;
        status: import(".prisma/client").$Enums.TokenStatus;
        bookedAt: Date;
        calledAt: Date;
        servedAt: Date;
        canceledAt: Date;
        noShowAt: Date;
        patient: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        doctor: {
            id: string;
            fullName: string;
            specialization: string;
        };
        session: {
            id: string;
            sessionDate: Date;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentTokenNo: number;
            maxTokenNo: number;
        };
    }[]>;
};
//# sourceMappingURL=admin.service.d.ts.map