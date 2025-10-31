import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Articles } from './article.entity';
import { LearningMaterials } from './learning-material.entity';
import { MapLocations } from './map-location.entity';

@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn()
  CategoryID: number;

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  Name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Description: string;

  @OneToMany(() => Articles, (article) => article.category)
  articles: Articles[];

  @OneToMany(() => LearningMaterials, (material) => material.category)
  learningMaterials: LearningMaterials[];

  @OneToMany(() => MapLocations, (location) => location.category)  // ← THÊM
  mapLocations: MapLocations[];
}