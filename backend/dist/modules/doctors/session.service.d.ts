declare class SessionService {
    startSession(doctorId: string): Promise<{
        session: {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentToken: number;
            maxToken: number;
            startedAt: Date;
        };
    }>;
    pauseSession(doctorId: string): Promise<{
        session: {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentToken: number;
            maxToken: number;
        };
    }>;
    resumeSession(doctorId: string): Promise<{
        session: {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentToken: number;
            maxToken: number;
        };
    }>;
    nextToken(doctorId: string): Promise<{
        session: {
            id: string;
            currentToken: number;
            maxToken: number;
            status: "ACTIVE";
        };
        message: string;
        calledToken?: undefined;
    } | {
        session: {
            id: string;
            currentToken: number;
            maxToken: number;
            status: "ACTIVE";
        };
        calledToken: {
            id: string;
            tokenNo: number;
            patientName: string;
        };
        message?: undefined;
    }>;
    endSession(doctorId: string): Promise<{
        session: {
            id: string;
            status: import(".prisma/client").$Enums.SessionStatus;
            currentToken: number;
            maxToken: number;
            endedAt: Date;
        };
    }>;
    getSessionAnalytics(doctorId: string, range: 'today' | 'week' | 'month'): Promise<{
        totalTokens: number;
        served: number;
        waiting: number;
        called: number;
        canceled: number;
        noShow: number;
    }>;
}
export declare const sessionService: SessionService;
export {};
//# sourceMappingURL=session.service.d.ts.map