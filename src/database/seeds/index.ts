import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seed';

/**
 * Run all seeds
 */
export const runSeeds = async (connection: DataSource): Promise<void> => {
  try {
    console.log('Starting database seeding...');
    
    // Chạy các seeds theo thứ tự
    await seedRoles(connection);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
};
