"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const auth_1 = require("@/lib/auth");
const router = express_1.default.Router();
exports.adminRoutes = router;
router.use(auth_1.authMiddleware);
router.use(auth_1.requireAdmin);
router.get('/approvals/pending', admin_controller_1.adminController.getPendingApprovals);
router.post('/approvals/:id/approve', admin_controller_1.adminController.approveDoctor);
router.post('/approvals/:id/reject', admin_controller_1.adminController.rejectDoctor);
router.get('/stats', admin_controller_1.adminController.getDashboardStats);
router.get('/doctors', admin_controller_1.adminController.getAllDoctors);
router.delete('/doctors/:id', admin_controller_1.adminController.deleteDoctor);
router.get('/patients', admin_controller_1.adminController.getAllPatients);
router.delete('/patients/:id', admin_controller_1.adminController.deletePatient);
//# sourceMappingURL=admin.routes.js.map