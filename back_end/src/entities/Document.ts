import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documents') 
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  citizenId!: string;

  @Column()
  citizenFullName!: string;

  @Column()
  documentType!: string;

  @Column()
  councilJurisdiction!: string;

  @Column()
  filePath!: string;

  @Column({ default: 'PENDING_VERIFICATION' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}