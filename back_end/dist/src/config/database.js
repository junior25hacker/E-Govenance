"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const Document_1 = require("../entities/Document");
const User_1 = require("../entities/User");
const Request_1 = require("../entities/Request");
const Report_1 = require("../entities/Report");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: 'emergence_connect.sqlite',
    synchronize: true, // Builds tables automatically
    logging: false,
    entities: [
        User_1.User,
        Document_1.Document,
        Request_1.Request,
        Report_1.Report
    ],
    subscribers: [],
    migrations: [],
});
