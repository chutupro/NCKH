import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Articles } from './article.entity'; 

@Entity('Images')
export class Images {
  @PrimaryGeneratedColumn()
  ImageID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  FilePath: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  AltText: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Type: string | null;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.images, { nullable: true })
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;
}