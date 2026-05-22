import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    citizenId: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ nullable: true })
    fullName: string;

    @Column({ default: false })
    profileComplete: boolean;

    @Column({ nullable: true })
    verificationDocType: string;

    @Column({ nullable: true })
    verificationDocPath: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
