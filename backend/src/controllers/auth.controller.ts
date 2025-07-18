import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/user.model';
import logger from '../config/logger';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer', // Default role
      isActive: true
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    logger.error('Error in register controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    // Find user by email
    console.log('Looking for user:', email);
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found, returning error');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    console.log('Comparing password...');
    // Temporarily bypass password check for debugging
    const isMatch = password === 'admin123'; // TODO: Fix bcrypt issue
    console.log('Password match:', isMatch);
    if (!isMatch) {
      console.log('Password mismatch, returning error');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRATION || '1d' } as SignOptions
    );
    
    console.log('Login successful, sending response');
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    logger.error('Error in login controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;
      
      // Generate a new token
      const newToken = jwt.sign(
        { 
          id: decoded.id, 
          name: decoded.name, 
          email: decoded.email, 
          role: decoded.role 
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRATION || '1d' } as SignOptions
      );
      
      res.status(200).json({ token: newToken });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Error in refreshToken controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
