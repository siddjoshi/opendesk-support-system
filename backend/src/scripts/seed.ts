import bcrypt from 'bcryptjs';
import { setupDatabase } from '../config/database';
import User from '../models/user.model';

const seedUsers = async () => {
  try {
    // Connect to the database
    await setupDatabase();
    
    console.log('Creating seed users...');
    
    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@opendesk.com' } });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@opendesk.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
    
    // Create agent user
    const agentExists = await User.findOne({ where: { email: 'agent@opendesk.com' } });
    if (!agentExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('agent123', salt);
      
      await User.create({
        name: 'Agent User',
        email: 'agent@opendesk.com',
        password: hashedPassword,
        role: 'agent',
        isActive: true
      });
      console.log('Agent user created');
    } else {
      console.log('Agent user already exists');
    }
    
    // Create customer user
    const customerExists = await User.findOne({ where: { email: 'customer@opendesk.com' } });
    if (!customerExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('customer123', salt);
      
      await User.create({
        name: 'Customer User',
        email: 'customer@opendesk.com',
        password: hashedPassword,
        role: 'customer',
        isActive: true
      });
      console.log('Customer user created');
    } else {
      console.log('Customer user already exists');
    }
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
