import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('document_requests')
export class DocumentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  referenceId: string; // REQ-2026-XXXXX

  @Column()
  documentType: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  purpose: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED, COMPLETED

  @CreateDateColumn()
  createdAt: Date;
}
