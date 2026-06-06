import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column({ nullable: true })
  citizenFullName: string;

  @Column()
  documentType: string;

  @Column({ nullable: true })
  documentName: string; // Human-readable name e.g. "Birth Certificate"

  @Column({ nullable: true })
  councilJurisdiction: string;

  @Column('text', { nullable: true })
  data: string; // Legacy: JSON string of details or base64 payload

  /** Disk path for internal server use */
  @Column({ nullable: true })
  filePath: string;

  /** Publicly accessible URL served via /uploads/ static route */
  @Column({ nullable: true })
  fileUrl: string;

  /** Original filename from the user's machine */
  @Column({ nullable: true })
  originalFilename: string;

  @Column({ default: 'pending' })
  status: string; // pending | verified | rejected

  @Column({ nullable: true })
  verifiedBy: string; // Admin ID / name who approved or rejected

  @Column({ nullable: true })
  verificationHash: string;

  @Column({ nullable: true })
  issuedDate: string;

  @Column({ nullable: true })
  expiryDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
