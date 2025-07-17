import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateUserCreation } from '../middleware/validators';

const router = Router();

// User routes - all protected and require admin privileges
router.use(authenticate);
router.use(authorize('admin'));

// Get all users
router.get('/', (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: 'Get all users endpoint' });
});

// Get a specific user
router.get('/:id', (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Get user with ID: ${req.params.id}` });
});

// Create a new user
router.post('/', validateUserCreation, (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(201).json({ message: 'Create user endpoint' });
});

// Update a user
router.put('/:id', validateUserCreation, (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Update user with ID: ${req.params.id}` });
});

// Delete a user
router.delete('/:id', (req: Request, res: Response) => {
  // Placeholder for controller implementation
  res.status(200).json({ message: `Delete user with ID: ${req.params.id}` });
});

export default router;
