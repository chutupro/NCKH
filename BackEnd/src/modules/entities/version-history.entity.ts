import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Articles } from './article.entity';
import { Users } from './user.entity'; 

@Entity('VersionHistory')
export class VersionHistory {
  @PrimaryGeneratedColumn()
  VersionID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  Changes: string;

  @CreateDateColumn({ type: 'datetime' })
  Timestamp: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.versionHistory)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Users, (user) => user.versionHistory)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}