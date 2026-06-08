import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SourceModule {
  REQUESTS = 'Requests',
  SECURITY = 'Security',
  DOCUMENTS = 'Documents',
  ACCOUNT = 'Account',
}

@Entity('system_activity_logs')
export class SystemActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  userId: string; // The owner/actor

  @Column({ nullable: true })
  performedBy: string; // User or System

  @Column({ type: 'varchar', nullable: true })
  sourceModule: string; // Used string type for broader compatibility

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', default: LogSeverity.LOW })
  severity: string;

  @Column({ nullable: true })
  referenceId: string; // Link to request, document, etc.

  @Column({ type: 'text', nullable: true })
  metadata: string; // JSON string for extra fields
}
