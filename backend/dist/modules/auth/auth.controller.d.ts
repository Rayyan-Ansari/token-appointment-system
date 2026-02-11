import { Request, Response } from 'express';
import { AuthRequest } from '@/lib/auth';
declare class AuthController {
    registerPatient(req: Request, res: Response): Promise<void>;
    registerDoctor(req: Request, res: Response): Promise<void>;
    loginPatient(req: Request, res: Response): Promise<void>;
    loginDoctor(req: Request, res: Response): Promise<void>;
    loginAdmin(req: Request, res: Response): Promise<void>;
    getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=auth.controller.d.ts.map