"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenController = void 0;
const token_service_1 = require("./token.service");
const validators_1 = require("@/lib/validators");
class TokenController {
    async bookToken(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const data = (0, validators_1.validateRequest)(validators_1.bookTokenSchema)(req.body);
            const result = await token_service_1.tokenService.bookToken(req.user.userId, data);
            res.status(201).json({
                success: true,
                message: 'Token booked successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to book token'
            });
        }
    }
    async getMyTokens(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const query = (0, validators_1.validateRequest)(validators_1.myTokensSchema)(req.query);
            const result = await token_service_1.tokenService.getMyTokens(req.user.userId, query.doctorId, query.status);
            res.json({
                success: true,
                message: 'Tokens retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get tokens'
            });
        }
    }
    async getSessionTokens(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            const { sessionId } = req.params;
            const result = await token_service_1.tokenService.getSessionTokens(sessionId);
            res.json({
                success: true,
                message: 'Session tokens retrieved successfully',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get session tokens'
            });
        }
    }
}
exports.tokenController = new TokenController();
//# sourceMappingURL=token.controller.js.map