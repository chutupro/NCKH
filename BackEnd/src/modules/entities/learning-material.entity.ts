import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Categories } from './category.entity'; 

@Entity('LearningMaterials')
export class LearningMaterials {
  @PrimaryGeneratedColumn()
  MaterialID: number;

  @Column({ type: 'nvarchar', length: 200, nullable: false })
  Title: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  Content: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  Level: string;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Categories, (category) => category.learningMaterials)
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;
}