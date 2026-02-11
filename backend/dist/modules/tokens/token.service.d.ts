import { BookTokenInput } from '@/lib/validators';
declare class TokenService {
    bookToken(patientId: string, data: BookTokenInput): Promise<{
        token: {
            id: string;
            tokenNo: number;
            status: import(".prisma/client").$Enums.TokenStatus;
            bookedAt: Date;
            tokensAhead: number;
        };
        session: {
            id: string;
            currentToken: number;
            maxToken: number;
            status: "NOT_STARTED" | "ACTIVE" | "PAUSED";
        };
        doctor: {
            fullName: string;
            specialization: string;
            id: bigint;
        };
    }>;
    getMyTokens(patientId: string, doctorId?: bigint, status?: string): Promise<{
        id: string;
        tokenNo: number;
        status: import(".prisma/client").$Enums.TokenStatus;
        bookedAt: Date;
        calledAt: Date;
        servedAt: Date;
        tokensAhead: number;
        session: {
            id: string;
            sessionDate: Date;
            currentToken: number;
            maxToken: number;
            status: import(".prisma/client").$Enums.SessionStatus;
            doctor: {
                fullName: string;
                specialization: string;
                id: bigint;
            };
        };
    }[]>;
    getDoctorSession(doctorId: bigint, patientId?: string): Promise<{
        session: {
            id: any;
            status: string;
            currentToken: number;
            maxToken: number;
            queueLength: number;
            doctorId?: undefined;
            sessionDate?: undefined;
            currentTokenNo?: undefined;
            maxTokenNo?: undefined;
            startedAt?: undefined;
            endedAt?: undefined;
        };
        doctor: {
            fullName: string;
            specialization: string;
            yearsExperience: number;
            id: bigint;
        };
        myToken: any;
    } | {
        session: {
            id: string;
            doctorId: string;
            sessionDate: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentTokenNo: number;
            maxTokenNo: number;
            startedAt: string;
            endedAt: string;
            currentToken?: undefined;
            maxToken?: undefined;
            queueLength?: undefined;
        };
        doctor: {
            fullName: string;
            specialization: string;
            yearsExperience: number;
            id: bigint;
        };
        myToken: any;
    }>;
}
export declare const tokenService: TokenService;
export {};
//# sourceMappingURL=token.service.d.ts.map