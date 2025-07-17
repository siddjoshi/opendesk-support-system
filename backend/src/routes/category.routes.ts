import { Router } from 'express';
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
router.delete('/:id', authenticate, deleteCategory);

export default router;