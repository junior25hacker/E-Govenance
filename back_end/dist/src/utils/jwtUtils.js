"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = exports.verifyJWT = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (payload, expiresIn = '7d') => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateJWT = generateJWT;
const verifyJWT = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'fallback-secret-key';
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyJWT = verifyJWT;
const decodeJWT = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeJWT = decodeJWT;
