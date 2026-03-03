"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("./auth");
class SocketManager {
    constructor() {
        this.io = null;
    }
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            const token = socket.handshake.auth?.token;
            if (token) {
                try {
                    const payload = (0, auth_1.verifyToken)(token);
                    socket.data.user = payload;
                    socket.join(`user:${payload.userId}`);
                    console.log(`User authenticated via handshake: ${payload.email} (${payload.role})`);
                    socket.emit('authenticated', { success: true, user: payload });
                }
                catch (error) {
                    console.error('Invalid token in socket handshake');
                    socket.emit('authenticated', { success: false, message: 'Invalid token' });
                }
            }
            socket.on('authenticate', (token) => {
                try {
                    const payload = (0, auth_1.verifyToken)(token);
                    socket.data.user = payload;
                    socket.join(`user:${payload.userId}`);
                    console.log(`User authenticated: ${payload.email} (${payload.role})`);
                    socket.emit('authenticated', { success: true, user: payload });
                }
                catch (error) {
                    socket.emit('authenticated', { success: false, message: 'Invalid token' });
                }
            });
            socket.on('join-doctor-room', (doctorId) => {
                socket.join(`doctor:${doctorId}`);
                console.log(`Client ${socket.id} joined doctor room: ${doctorId}`);
            });
            socket.on('leave-doctor-room', (doctorId) => {
                socket.leave(`doctor:${doctorId}`);
                console.log(`Client ${socket.id} left doctor room: ${doctorId}`);
            });
            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
        return this.io;
    }
    emitToDoctorRoom(doctorId, event, data) {
        if (!this.io)
            return;
        this.io.to(`doctor:${doctorId}`).emit(event, data);
    }
    emitToUser(userId, event, data) {
        if (!this.io)
            return;
        this.io.to(`user:${userId}`).emit(event, data);
    }
    broadcast(event, data) {
        if (!this.io)
            return;
        this.io.emit(event, data);
    }
    getIO() {
        return this.io;
    }
}
exports.socketManager = new SocketManager();
//# sourceMappingURL=socket.js.map