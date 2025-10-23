  import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
  import { Categories } from './category.entity'; 

 @Entity('learning_materials')
  export class LearningMaterials {
  @PrimaryGeneratedColumn()
  MaterialID: number;

  @Column({ type: 'nvarchar', length: 200 })
  Title: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  Content: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  Level: string;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @ManyToOne(() => Categories, (category) => category.learningMaterials)
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;
}
