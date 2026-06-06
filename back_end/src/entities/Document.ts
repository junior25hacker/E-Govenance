import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  citizenId!: string;

  @Column({ nullable: true })
  citizenFullName!: string;

  @Column()
  documentType!: string;

  @Column({ nullable: true })
  documentName!: string;

  @Column({ nullable: true })
  councilJurisdiction!: string;

  /** Disk path for internal use (e.g. uploads/1234-cert.pdf) */
  @Column({ nullable: true })
  filePath!: string;

  /** Publicly accessible URL path served by express.static */
  @Column({ nullable: true })
  fileUrl!: string;

  /** Original filename from the user's machine */
  @Column({ nullable: true })
  originalFilename!: string;

  @Column({ default: 'PENDING_VERIFICATION' })
  status!: string;

  /** Name / ID of the admin who verified the document */
  @Column({ nullable: true })
  verifiedBy!: string;

  /** Short hash for integrity / QR verification */
  @Column({ nullable: true })
  verificationHash!: string;

  @Column({ nullable: true })
  issuedDate!: string;

  @Column({ nullable: true })
  expiryDate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}