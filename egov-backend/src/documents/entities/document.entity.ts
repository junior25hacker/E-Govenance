import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  citizenId: string;

  @Column()
  documentType: string;

  @Column()
  councilJurisdiction: string;

  @Column('text')
  data: string; // JSON string of document details or Base64 payload

  @Column({ default: 'pending' })
  status: string; // pending, verified, rejected

  @Column({ nullable: true })
  verifiedBy: string; // admin ID who approved/rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
