import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateTicketCreation, validateTicketUpdate } from '../middleware/validators';
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment
} from '../controllers/ticket.controller';

const router = Router();

// Ticket routes - protected with authentication
router.use(authenticate);

// Get all tickets - accessible to agents and admins
router.get('/', authorize('agent', 'admin'), getAllTickets);

// Create a new ticket - accessible to all authenticated users
router.post('/', validateTicketCreation, createTicket);

// Get a specific ticket - accessible to owner, agents and admins
router.get('/:id', getTicketById);

// Update a ticket - accessible to agents and admins
router.put('/:id', validateTicketUpdate, authorize('agent', 'admin'), updateTicket);

// Delete a ticket - accessible to admins only
router.delete('/:id', authorize('admin'), deleteTicket);

// Add a comment to a ticket - accessible to ticket owner, agents and admins
router.post('/:id/comments', addComment);

export default router;
