import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  referenceId: string; // RPT-2026-XXXXX

  @Column()
  category: string;

  @Column()
  priority: string; // LOW, MEDIUM, HIGH

  @Column()
  location: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

  @CreateDateColumn()
  createdAt: Date;
}
