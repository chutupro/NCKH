import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('Images')
export class Image {
  @PrimaryGeneratedColumn()
  ImageID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'varchar', length: 255 })
  FilePath: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  AltText: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Type: string;

  @ManyToOne(() => Article, article => article.images)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;
}
