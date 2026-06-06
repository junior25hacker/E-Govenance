"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', authController_1.login);
router.post('/register', authController_1.register);
router.post('/logout', authController_1.logout);
// Protected routes
router.get('/profile', authMiddleware_1.authMiddleware, authController_1.getProfile);
router.put('/update', authMiddleware_1.authMiddleware, authController_1.updateProfile);
exports.default = router;
