"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.logout = exports.register = exports.login = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const login = async (req, res) => {
    try {
        console.log('[AUTH] Login attempt for:', req.body.citizenId);
        const { citizenId, password } = req.body;
        if (!citizenId || !password) {
            return res.status(400).json({ status: 'fail', message: 'Citizen ID and password are required' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { citizenId } });
        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'Invalid Citizen ID or password' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'fail', message: 'Invalid Citizen ID or password' });
        }
        const token = (0, jwtUtils_1.generateJWT)({ id: user.id, citizenId: user.citizenId, email: user.email }, process.env.JWT_EXPIRY || '7d');
        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: { id: user.id, citizenId: user.citizenId, email: user.email, fullName: user.fullName }
            }
        });
    }
    catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, passwordConfirm, phone } = req.body;
        if (!firstName || !lastName || !password || !passwordConfirm) {
            return res.status(400).json({ status: 'fail', message: 'Name and password fields are required' });
        }
        if (password !== passwordConfirm) {
            return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        if (email) {
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ status: 'fail', message: 'Email already registered' });
            }
        }
        const citizenId = `CITIZEN-${Math.floor(1000 + Math.random() * 9000)}`;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const fullName = `${firstName} ${lastName}`;
        const newUser = userRepository.create({
            citizenId,
            fullName,
            email,
            phone,
            passwordHash
        });
        await userRepository.save(newUser);
        const token = (0, jwtUtils_1.generateJWT)({ id: newUser.id, citizenId: newUser.citizenId, email: newUser.email }, process.env.JWT_EXPIRY || '7d');
        res.status(201).json({
            status: 'success',
            data: {
                token,
                user: { id: newUser.id, citizenId: newUser.citizenId, email: newUser.email, fullName: newUser.fullName }
            }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.register = register;
const logout = (req, res) => {
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }
        res.status(200).json({
            status: 'success',
            data: {
                id: user.id,
                citizenId: user.citizenId,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }
        const { fullName, email, phone, currentPassword, newPassword } = req.body;
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }
        // Optional password update
        if (currentPassword && newPassword) {
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
            }
            user.passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
        }
        if (fullName)
            user.fullName = fullName;
        if (email)
            user.email = email;
        if (phone)
            user.phone = phone;
        await userRepository.save(user);
        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                citizenId: user.citizenId,
                email: user.email,
                phone: user.phone,
                fullName: user.fullName
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
