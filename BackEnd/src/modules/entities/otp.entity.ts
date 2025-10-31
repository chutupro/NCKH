import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('OTPs')
export class OTP {
  @PrimaryGeneratedColumn()
  OTPID: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Email: string;

  @Column({ type: 'varchar', length: 6, nullable: false })
  Code: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: false })
  ExpiresAt: Date;

  @Column({ type: 'boolean', default: false })
  IsUsed: boolean;
}

