import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  documentType: string;

  @Column({ default: 'Central Registry' })
  councilJurisdiction: string;

  @Column('text', { nullable: true })
  data: string; // Legacy: JSON string of document details or Base64 payload

  @Column({ default: 'pending' })
  status: string; // pending, verified, rejected

  @Column({ nullable: true })
  verifiedBy: string; // admin ID who approved/rejected

  // ── File upload metadata ──

  @Column({ nullable: true })
  originalFilename: string; // Original name the citizen uploaded (e.g., "birth_cert.pdf")

  @Column({ nullable: true })
  storedFilename: string; // UUID-based name on disk (e.g., "a3f8e2d1-...pdf")

  @Column({ nullable: true })
  mimeType: string; // e.g., "application/pdf", "image/jpeg"

  @Column({ type: 'integer', nullable: true })
  fileSize: number; // Size in bytes

  // ── Citizen identity snapshot ──

  @Column({ nullable: true })
  fullName: string; // Citizen's full name at time of submission

  @Column({ nullable: true })
  nationalId: string; // Citizen's national ID number

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
