"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRoutes = void 0;
const express_1 = __importDefault(require("express"));
const token_controller_1 = require("./token.controller");
const auth_1 = require("@/lib/auth");
const router = express_1.default.Router();
exports.tokenRoutes = router;
router.use(auth_1.authMiddleware);
router.use(auth_1.requirePatient);
router.post('/book', token_controller_1.tokenController.bookToken);
router.get('/my', token_controller_1.tokenController.getMyTokens);
//# sourceMappingURL=token.routes.js.map