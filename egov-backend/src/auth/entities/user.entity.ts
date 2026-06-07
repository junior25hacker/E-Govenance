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

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    nationalId: string;

    @Column({ nullable: true })
    avatar: string;

    @Column('text', { nullable: true })
    preferences: string; // Stored as JSON string

    @Column({ default: false })
    profileComplete: boolean;

    @Column({ nullable: true })
    verificationDocType: string;

    @Column({ nullable: true })
    verificationDocPath: string;

    @Column({ default: 'CITIZEN' })
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
