import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('birth_declarations')
export class BirthDeclaration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  citizenId!: string;

  @Column()
  parentFullName!: string;

  @Column()
  parentIdNumber!: string;

  @Column()
  childFullName!: string;

  @Column()
  dateOfBirth!: string;

  @Column()
  placeOfBirth!: string;

  @Column()
  gender!: string;

  @Column()
  councilJurisdiction!: string;

  @Column({ nullable: true })
  birthCertificatePath!: string;

  @Column({ nullable: true })
  identityDocPath!: string;

  @Column({ default: 'STEP_1_SUBMITTED' })
  status!: string;

  @Column({ default: 1 })
  currentStep!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}