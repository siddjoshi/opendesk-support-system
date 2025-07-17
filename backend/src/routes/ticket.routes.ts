import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateTicketCreation, validateTicketUpdate } from '../middleware/validators';

const router = Router();

// Ticket routes - protected with authentication
router.use(authenticate);

// Get all tickets - accessible to agents and admins
router.get('/', authorize('agent', 'admin'), (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: 'Get all tickets endpoint' });
});

// Create a new ticket - accessible to all authenticated users
router.post('/', validateTicketCreation, (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(201).json({ message: 'Create ticket endpoint' });
});

// Get a specific ticket - accessible to owner, agents and admins
router.get('/:id', (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Get ticket with ID: ${req.params.id}` });
});

// Update a ticket - accessible to agents and admins
router.put('/:id', validateTicketUpdate, authorize('agent', 'admin'), (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Update ticket with ID: ${req.params.id}` });
});

// Delete a ticket - accessible to admins only
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Delete ticket with ID: ${req.params.id}` });
});

// Add a comment to a ticket - accessible to ticket owner, agents and admins
router.post('/:id/comments', (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(201).json({ message: `Add comment to ticket with ID: ${req.params.id}` });
});

export default router;
