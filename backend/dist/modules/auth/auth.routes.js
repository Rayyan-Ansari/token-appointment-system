"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("@/lib/auth");
const router = express_1.default.Router();
exports.authRoutes = router;
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC, and DOCX files are allowed.'));
        }
    }
});
router.post('/patient/register', auth_controller_1.authController.registerPatient);
router.post('/patient/login', auth_controller_1.authController.loginPatient);
router.post('/doctor/register', upload.single('licenseDocument'), auth_controller_1.authController.registerDoctor);
router.post('/doctor/login', auth_controller_1.authController.loginDoctor);
router.post('/admin/login', auth_controller_1.authController.loginAdmin);
router.get('/me', auth_1.authMiddleware, auth_controller_1.authController.getMe);
router.put('/profile', auth_1.authMiddleware, auth_controller_1.authController.updateProfile);
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
    }
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
});
//# sourceMappingURL=auth.routes.js.map