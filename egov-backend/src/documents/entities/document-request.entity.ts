import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('requests')
export class DocumentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  citizenId: string;

  @Column()
  documentType: string;

  @Column()
  councilJurisdiction: string;

  @Column()
  purpose: string;

  @Column()
  applicantName: string;

  @Column()
  applicantId: string;

  @Column()
  applicantEmail: string;

  @Column()
  applicantPhone: string;

  @Column({ default: 'PENDING' }) // PENDING, PROCESSING, APPROVED, REJECTED
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
