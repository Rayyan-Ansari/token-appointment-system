import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export interface SocketEvents {
    'session:started': {
        doctorId: string;
        sessionId: string;
        status: string;
        currentToken: number;
        maxToken: number;
        startedAt: string;
    };
    'session:paused': {
        doctorId: string;
        sessionId: string;
    };
    'session:resumed': {
        doctorId: string;
        sessionId: string;
    };
    'session:ended': {
        doctorId: string;
        sessionId: string;
    };
    'token:booked': {
        doctorId: string;
        sessionId: string;
        tokenNo: number;
        patientId: string;
        maxToken: number;
        queueLength: number;
    };
    'token:next': {
        doctorId: string;
        sessionId: string;
        currentToken: number;
    };
    'token:served': {
        doctorId: string;
        sessionId: string;
        tokenNo: number;
    };
    'mytoken:created': {
        tokenId: string;
        doctorId: string;
        sessionId: string;
        tokenNo: number;
        tokensAhead: number;
    };
    'mytoken:updated': {
        tokenId: string;
        status: string;
        calledAt?: string;
        servedAt?: string;
    };
}
declare class SocketManager {
    private io;
    initialize(httpServer: HTTPServer): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    emitToDoctorRoom<T extends keyof SocketEvents>(doctorId: string, event: T, data: SocketEvents[T]): void;
    emitToUser<T extends keyof SocketEvents>(userId: string, event: T, data: SocketEvents[T]): void;
    broadcast<T extends keyof SocketEvents>(event: T, data: SocketEvents[T]): void;
    getIO(): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
}
export declare const socketManager: SocketManager;
export {};
//# sourceMappingURL=socket.d.ts.map