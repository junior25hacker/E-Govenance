import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column()
  priority: string;

  @Column()
  location: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  citizenId: string;

  @Column({ default: 'OPEN' }) // OPEN, IN_PROGRESS, RESOLVED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
