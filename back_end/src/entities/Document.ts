import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documents') 
// dont forget to remove the "!" later on when the connection to the database
//will be established.
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