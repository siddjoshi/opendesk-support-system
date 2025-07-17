import bcrypt from 'bcryptjs';
import { setupDatabase } from '../config/database';
import User from '../models/user.model';

const seedUsers = async () => {
  try {
    // Connect to the database
    await setupDatabase();
    
    console.log('Cleaning up existing users...');
    
    // Remove existing users
    await User.destroy({
      where: {
        email: ['admin@opendesk.com', 'agent@opendesk.com', 'customer@opendesk.com']
      }
    });
    
    console.log('Creating new seed users...');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
      
    await User.create({
      name: 'Admin User',
      email: 'admin@opendesk.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    console.log('Admin user created');
    
    // Create agent user
    const agentPassword = await bcrypt.hash('agent123', salt);
      
    await User.create({
      name: 'Agent User',
      email: 'agent@opendesk.com',
      password: agentPassword,
      role: 'agent',
      isActive: true
    });
    console.log('Agent user created');
    
    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', salt);
      
    await User.create({
      name: 'Customer User',
      email: 'customer@opendesk.com',
      password: customerPassword,
      role: 'customer',
      isActive: true
    });
    console.log('Customer user created');
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
