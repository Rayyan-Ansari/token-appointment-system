import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './auth';

// Socket event types
export interface SocketEvents {
  // Session events (broadcasted to all clients in doctor room)
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

  // Token events (broadcasted to doctor room)
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

  // Personal token events (sent to specific user)
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

class SocketManager {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Authenticate from handshake auth token right away if provided
      const token = socket.handshake.auth?.token;
      if (token) {
        try {
          const payload = verifyToken(token);
          socket.data.user = payload;

          // Join user-specific room
          socket.join(`user:${payload.userId}`);

          console.log(`User authenticated via handshake: ${payload.email} (${payload.role})`);
          socket.emit('authenticated', { success: true, user: payload });
        } catch (error) {
          console.error('Invalid token in socket handshake');
          socket.emit('authenticated', { success: false, message: 'Invalid token' });
        }
      }

      // Handle authentication (fallback if client emits manually)
      socket.on('authenticate', (token: string) => {
        try {
          const payload = verifyToken(token);
          socket.data.user = payload;

          // Join user-specific room
          socket.join(`user:${payload.userId}`);

          console.log(`User authenticated: ${payload.email} (${payload.role})`);

          socket.emit('authenticated', { success: true, user: payload });
        } catch (error) {
          socket.emit('authenticated', { success: false, message: 'Invalid token' });
        }
      });

      // Handle joining doctor rooms for live updates
      socket.on('join-doctor-room', (doctorId: string) => {
        socket.join(`doctor:${doctorId}`);
        console.log(`Client ${socket.id} joined doctor room: ${doctorId}`);
      });

      // Handle leaving doctor rooms
      socket.on('leave-doctor-room', (doctorId: string) => {
        socket.leave(`doctor:${doctorId}`);
        console.log(`Client ${socket.id} left doctor room: ${doctorId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  // Emit to doctor room (all clients watching this doctor)
  emitToDoctorRoom<T extends keyof SocketEvents>(
    doctorId: string,
    event: T,
    data: SocketEvents[T]
  ) {
    if (!this.io) return;
    this.io.to(`doctor:${doctorId}`).emit(event, data);
  }

  // Emit to specific user
  emitToUser<T extends keyof SocketEvents>(
    userId: string,
    event: T,
    data: SocketEvents[T]
  ) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast<T extends keyof SocketEvents>(
    event: T,
    data: SocketEvents[T]
  ) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  getIO() {
    return this.io;
  }
}

export const socketManager = new SocketManager();