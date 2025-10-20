import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Articles } from './article.entity'; 
import { Users } from './user.entity'; 

@Entity('Likes')
export class Likes {
  @PrimaryGeneratedColumn()
  LikeID: number;

  @Column({ type: 'int', nullable: false })
  ArticleID: number;

  @Column({ type: 'int', nullable: false })
  UserID: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.likes)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Users, (user) => user.likes)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}