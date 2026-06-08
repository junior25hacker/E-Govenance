import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RequestLog } from './request-log.entity';

export enum RequestStage {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Entity('tracking_requests')
export class TrackingRequest {
  @PrimaryGeneratedColumn('uuid')
  requestId: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    default: RequestStage.PENDING
  })
  currentStatus: RequestStage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RequestLog, log => log.request, { cascade: true })
  logs: RequestLog[];
}
