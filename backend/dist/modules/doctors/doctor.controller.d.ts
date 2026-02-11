import { Response } from 'express';
import { AuthRequest } from '@/lib/auth';
declare class DoctorController {
    getDoctors(req: AuthRequest, res: Response): Promise<void>;
    getDoctorSession(req: AuthRequest, res: Response): Promise<void>;
    getDoctorProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    startSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    pauseSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    resumeSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    nextToken(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    endSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getSessionAnalytics(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const doctorController: DoctorController;
export {};
//# sourceMappingURL=doctor.controller.d.ts.map