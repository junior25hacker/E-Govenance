import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Document } from '../entities/Document'; 

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // 👈 This magic command builds the tables automatically based on your classes
  logging: false,
  entities: [
    Document 
  ],
  subscribers: [],
  migrations: [],
});