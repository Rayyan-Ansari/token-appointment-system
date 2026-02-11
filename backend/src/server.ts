import { createServer } from 'http';
import app from './app';
import { socketManager } from './lib/socket';

// Fix BigInt serialization for JSON
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Load environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
socketManager.initialize(httpServer);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  httpServer.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }

    console.log('Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📍 Environment: ${NODE_ENV}
🌐 HTTP Server: http://localhost:${PORT}
🔄 Socket.IO: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
  `);
});

export default httpServer;