"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./lib/socket");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const httpServer = (0, http_1.createServer)(app_1.default);
socket_1.socketManager.initialize(httpServer);
const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
    httpServer.close((err) => {
        if (err) {
            console.error('Error during server shutdown:', err);
            process.exit(1);
        }
        console.log('Server closed successfully');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
httpServer.listen(PORT, () => {
    console.log(`
🚀 Server is running!
📍 Environment: ${NODE_ENV}
🌐 HTTP Server: http://localhost:${PORT}
🔄 Socket.IO: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
  `);
});
exports.default = httpServer;
//# sourceMappingURL=server.js.map