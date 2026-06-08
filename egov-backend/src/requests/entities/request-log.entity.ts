import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrackingRequest } from './request.entity';

@Entity('tracking_request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column()
  actionType: string;

  @Column({ nullable: true })
  previousStatus: string;

  @Column()
  newStatus: string;

  @Column()
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => TrackingRequest, request => request.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: TrackingRequest;
}
