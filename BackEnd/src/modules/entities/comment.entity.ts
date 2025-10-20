import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Articles } from './article.entity'; 
import { Users } from './user.entity'; 

@Entity('Comments')
export class Comments {
  @PrimaryGeneratedColumn()
  CommentID: number;

  @Column({ type: 'int', nullable: false })
  ArticleID: number;

  @Column({ type: 'int', nullable: false })
  UserID: number;

  @Column({ type: 'int', nullable: true })
  ParentCommentID: number;

  @Column({ type: 'nvarchar', length: 1000, nullable: false })
  Content: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.comments)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Users, (user) => user.comments)
  @JoinColumn({ name: 'UserID' })
  user: Users;

  @ManyToOne(() => Comments, (comment) => comment.replies)
  @JoinColumn({ name: 'ParentCommentID' })
  parentComment: Comments;

  @OneToMany(() => Comments, (comment) => comment.parentComment)
  replies: Comments[];
}