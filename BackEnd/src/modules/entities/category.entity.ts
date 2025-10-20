import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Articles } from './article.entity';
import { LearningMaterials } from './learning-material.entity'; 

@Entity('Categories')
export class Categories {
  @PrimaryGeneratedColumn()
  CategoryID: number;

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  Name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Description: string;

  // --- RELATIONS ---
  @OneToMany(() => Articles, (article) => article.category)
  articles: Articles[];

  @OneToMany(() => LearningMaterials, (material) => material.category)
  learningMaterials: LearningMaterials[];
}