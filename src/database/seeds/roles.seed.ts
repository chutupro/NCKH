import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';

/**
 * Seed roles data
 */
export const seedRoles = async (connection: DataSource): Promise<void> => {
  const roleRepository = connection.getRepository(Role);
  
  // Kiểm tra xem đã có roles chưa
  const rolesCount = await roleRepository.count();
  
  if (rolesCount === 0) {
    // Thêm các roles mặc định
    await roleRepository.save([
      {
        roleName: 'Admin',
        description: 'Administrator with full access',
      },
      {
        roleName: 'Editor',
        description: 'Can create and edit content',
      },
      {
        roleName: 'User',
        description: 'Regular user with limited permissions',
      },
      {
        roleName: 'Moderator',
        description: 'Can moderate user contributions',
      }
    ]);
    
    console.log('Roles seeded successfully');
  } else {
    console.log('Roles already exist, skipping seed');
  }
};
