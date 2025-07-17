import { Request, Response } from 'express';
import Ticket from '../models/ticket.model';
import User from '../models/user.model';
import notificationService from '../services/notification.service';
import logger from '../config/logger';

// Create a new ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, priority = 'medium' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      userId,
      status: 'open',
    });

    // Send notification for ticket creation
    await notificationService.notifyTicketCreated(ticket.id);

    // Return the created ticket with user info
    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: createdTicket,
    });
  } catch (error) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const tickets = await Ticket.findAndCountAll({
      limit,
      offset,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      tickets: tickets.rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(tickets.count / limit),
        totalItems: tickets.count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific ticket
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);

    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a ticket
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { title, description, status, priority, assignedToId } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Store old values for notifications
    const oldStatus = ticket.status;
    const oldAssignedToId = ticket.assignedToId;

    // Update ticket
    const updatedTicket = await ticket.update({
      title: title || ticket.title,
      description: description || ticket.description,
      status: status || ticket.status,
      priority: priority || ticket.priority,
      assignedToId: assignedToId !== undefined ? assignedToId : ticket.assignedToId,
    });

    // Send notifications based on what changed
    if (status && status !== oldStatus) {
      await notificationService.notifyTicketUpdated(ticketId, oldStatus, status);
      
      // Send specific notifications for resolved/closed status
      if (status === 'resolved') {
        await notificationService.notifyTicketResolved(ticketId);
      } else if (status === 'closed') {
        await notificationService.notifyTicketClosed(ticketId);
      }
    }

    if (assignedToId && assignedToId !== oldAssignedToId) {
      await notificationService.notifyTicketAssigned(ticketId, assignedToId);
    }

    // Return updated ticket with user info
    const result = await Ticket.findByPk(ticketId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket: result,
    });
  } catch (error) {
    logger.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a ticket
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.destroy();

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    logger.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a comment to a ticket
export const addComment = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // In a real implementation, you'd save the comment to a separate Comments table
    // For now, we'll just send the notification
    await notificationService.notifyTicketCommented(ticketId, comment, userId);

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: {
        id: Date.now(), // Temporary ID
        content: comment,
        userId,
        ticketId,
        createdAt: new Date(),
      }
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};