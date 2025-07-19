import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validators';

const router = Router();

// Rate limiter: Maximum of 10 delete requests per 15 minutes
const deleteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many delete requests from this IP, please try again after 15 minutes.',
});

// Validation middleware
const categoryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Public routes (no authentication required)
router.get('/tree', getCategoryTree);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (authentication required)
router.post('/', authenticate, categoryValidation, validate, createCategory);
router.put('/:id', authenticate, categoryValidation, validate, updateCategory);
router.delete('/:id', authenticate, deleteRateLimiter, deleteCategory);

export default router;