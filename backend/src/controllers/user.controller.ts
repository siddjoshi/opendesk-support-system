import { Request, Response } from 'express';
import User from '../models/user.model';
import logger from '../config/logger';

// Get user notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'emailNotifications']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      preferences: user.emailNotifications
    });
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { emailNotifications } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate notification preferences structure
    const validPreferences = {
      ticketCreated: emailNotifications.ticketCreated !== undefined ? emailNotifications.ticketCreated : user.emailNotifications.ticketCreated,
      ticketUpdated: emailNotifications.ticketUpdated !== undefined ? emailNotifications.ticketUpdated : user.emailNotifications.ticketUpdated,
      ticketAssigned: emailNotifications.ticketAssigned !== undefined ? emailNotifications.ticketAssigned : user.emailNotifications.ticketAssigned,
      ticketCommented: emailNotifications.ticketCommented !== undefined ? emailNotifications.ticketCommented : user.emailNotifications.ticketCommented,
      ticketResolved: emailNotifications.ticketResolved !== undefined ? emailNotifications.ticketResolved : user.emailNotifications.ticketResolved,
      ticketClosed: emailNotifications.ticketClosed !== undefined ? emailNotifications.ticketClosed : user.emailNotifications.ticketClosed,
    };

    await user.update({
      emailNotifications: validPreferences
    });

    res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences: validPreferences
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'emailNotifications', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, email, emailNotifications } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (emailNotifications) updateData.emailNotifications = emailNotifications;

    await user.update(updateData);

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'emailNotifications', 'createdAt']
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};