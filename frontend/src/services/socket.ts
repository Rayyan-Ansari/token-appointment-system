import { io, Socket } from 'socket.io-client';
import type { SocketTokenUpdate } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect(token: string) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Set up event listeners
        this.socket.on('token:update', (data: SocketTokenUpdate) => {
            this.emit('token:update', data);
        });

        this.socket.on('token:booked', (data: any) => {
            this.emit('token:booked', data);
        });

        this.socket.on('token:next', (data: any) => {
            this.emit('token:next', data);
        });

        // Forwarding Session state changes
        ['session:started', 'session:paused', 'session:resumed', 'session:ended'].forEach(event => {
            this.socket?.on(event, (data: any) => {
                this.emit(event, data);
            });
        });

        // Patient specific token events
        this.socket.on('mytoken:updated', (data: any) => {
            this.emit('mytoken:updated', data);
        });

        this.socket.on('mytoken:created', (data: any) => {
            this.emit('mytoken:created', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: Function) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    private emit(event: string, data: any) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((callback) => callback(data));
        }
    }

    joinDoctorRoom(doctorId: string) {
        this.socket?.emit('join-doctor-room', doctorId);
    }

    leaveDoctorRoom(doctorId: string) {
        this.socket?.emit('leave-doctor-room', doctorId);
    }
}

export const socketService = new SocketService();
