import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Document } from '../entities/Document'; 
import { User } from '../entities/User';
import { Request } from '../entities/Request';
import { Report } from '../entities/Report';
import { Notification } from '../entities/Notification';
import { Message } from '../entities/Message';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'emergence_connect.sqlite',
  synchronize: true, // Builds tables automatically
  logging: false,
  entities: [
    User,
    Document,
    Request,
    Report,
    Notification,
    Message
  ],
  subscribers: [],
  migrations: [],
});