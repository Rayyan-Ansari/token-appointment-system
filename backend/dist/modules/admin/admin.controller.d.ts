import { Request, Response } from 'express';
export declare const adminController: {
    getPendingApprovals(req: Request, res: Response): Promise<void>;
    approveDoctor(req: Request, res: Response): Promise<void>;
    rejectDoctor(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getAllDoctors(req: Request, res: Response): Promise<void>;
    deleteDoctor(req: Request, res: Response): Promise<void>;
    getAllPatients(req: Request, res: Response): Promise<void>;
    deletePatient(req: Request, res: Response): Promise<void>;
    getAllTokens(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=admin.controller.d.ts.map