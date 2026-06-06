"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authMiddleware = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'No authentication token provided',
        });
    }
    try {
        const decoded = (0, jwtUtils_1.verifyJWT)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid or expired token',
        });
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = (0, jwtUtils_1.verifyJWT)(token);
            req.user = decoded;
        }
        catch (error) {
            // Token invalid but optional, continue anyway
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
