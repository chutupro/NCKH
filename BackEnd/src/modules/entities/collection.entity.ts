import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CollectionArticles } from './collection-article.entity';
import { Categories } from './category.entity';

@Entity('Collections')
export class Collections {
  @PrimaryGeneratedColumn()
  CollectionID: number;

  // Human-friendly title (can differ from internal 'Name')
  @Column({ type: 'nvarchar', length: 200, nullable: true })
  Title: string;

  // Short machine name / slug retained for backward compatibility
  @Column({ type: 'nvarchar', length: 200, nullable: false })
  Name: string;
  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  Description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ImagePath: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  ImageDescription: string;

  // Optional Category association (nullable FK)
  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @ManyToOne(() => Categories, (cat) => cat.collections, { nullable: true })
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @OneToMany(() => CollectionArticles, (ca) => ca.collection)
  collectionArticles: CollectionArticles[];
}
