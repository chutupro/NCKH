import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Collections } from './collection.entity';
import { Articles } from './article.entity';

@Entity('CollectionArticles')
export class CollectionArticles {
  @PrimaryGeneratedColumn()
  CollectionArticleID: number;

  @Column({ type: 'int' })
  CollectionID: number;

  @Column({ type: 'int' })
  ArticleID: number;

  @ManyToOne(() => Collections, (collection) => collection.collectionArticles)
  @JoinColumn({ name: 'CollectionID' })
  collection: Collections;

  @ManyToOne(() => Articles, (article) => article.images)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;
}
