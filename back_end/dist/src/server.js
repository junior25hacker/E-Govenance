"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
const frontendPath = path_1.default.join(__dirname, '../../');
app.use(express_1.default.static(frontendPath));
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Emergence-Connect API is online.' });
});
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/documents', documentRoutes_1.default);
// Initialize Database connection
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('[DATABASE] 🐘 PostgreSQL Connected Successfully!');
    startServer();
})
    .catch((error) => {
    console.warn('[DATABASE] ⚠️ PostgreSQL Connection failed (using mock data):', error.message);
    startServer();
});
function startServer() {
    app.listen(PORT, () => {
        console.log(`[SERVER] 🚀 Core API is running on http://localhost:${PORT}`);
    });
}
