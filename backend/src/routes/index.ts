import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check users
router.get('/debug/users', async (req: Request, res: Response) => {
  try {
    const User = require('../models/user.model').default;
    const users = await User.findAll();
    res.status(200).json({
      count: users.length,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }))
    });
  } catch (error: any) {
    console.error('Debug debug:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Debug endpoint to check password
router.post('/debug/check-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const User = require('../models/user.model').default;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password using the model's isValidPassword method
    const isMatch = await user.isValidPassword(password);
    
    // Also test with direct bcrypt compare
    const bcrypt = require('bcryptjs');
    const directCompare = await bcrypt.compare(password, user.password);
    
    res.status(200).json({
      user: {
        email: user.email,
        storedHashedPassword: user.password
      },
      passwordMatch: isMatch,
      directBcryptCompare: directCompare,
      providedPassword: password
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
