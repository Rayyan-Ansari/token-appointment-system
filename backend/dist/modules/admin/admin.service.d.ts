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
        qualification: string;
        specialization: string;
        yearsExperience: number;
        licenseNumber: string;
        createdAt: Date;
    }[]>;
    deleteDoctor(doctorId: string): Promise<{
        success: boolean;
    }>;
    getAllPatients(): Promise<{
        id: string;
        email: string;
        fullName: string;
        phone: string;
        createdAt: Date;
    }[]>;
    deletePatient(patientId: string): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=admin.service.d.ts.map