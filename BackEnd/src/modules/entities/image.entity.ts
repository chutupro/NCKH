import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Articles } from './article.entity'; 

@Entity('Images')
export class Images {
  @PrimaryGeneratedColumn()
  ImageID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  FilePath: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  AltText: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Type: string;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.images)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;
}