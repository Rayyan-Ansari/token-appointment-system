import { Response } from 'express';
import { AuthRequest } from '@/lib/auth';
declare class TokenController {
    bookToken(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMyTokens(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getSessionTokens(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const tokenController: TokenController;
export {};
//# sourceMappingURL=token.controller.d.ts.map