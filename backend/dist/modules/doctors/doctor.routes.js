"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = require("./doctor.controller");
const auth_1 = require("@/lib/auth");
const router = express_1.default.Router();
exports.doctorRoutes = router;
router.get('/', doctor_controller_1.doctorController.getDoctors);
router.get('/:id/session', doctor_controller_1.doctorController.getDoctorSession);
router.use(auth_1.authMiddleware);
router.use(auth_1.requireDoctor);
router.get('/me', doctor_controller_1.doctorController.getDoctorProfile);
router.post('/session/start', doctor_controller_1.doctorController.startSession);
router.post('/session/pause', doctor_controller_1.doctorController.pauseSession);
router.post('/session/resume', doctor_controller_1.doctorController.resumeSession);
router.post('/session/next', doctor_controller_1.doctorController.nextToken);
router.post('/session/end', doctor_controller_1.doctorController.endSession);
router.get('/session/analytics', doctor_controller_1.doctorController.getSessionAnalytics);
//# sourceMappingURL=doctor.routes.js.map