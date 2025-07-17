import { Router } from 'express';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  getPopularTags,
} from '../controllers/tag.controller';
import { authenticate } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middleware/validators';

const router = Router();

// Validation middleware
const tagValidation = [
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Public routes (no authentication required)
router.get('/popular', getPopularTags);
router.get('/', getAllTags);
router.get('/:id', getTagById);

// Protected routes (authentication required)
router.post('/', authenticate, tagValidation, validate, createTag);
router.put('/:id', authenticate, tagValidation, validate, updateTag);
router.delete('/:id', authenticate, deleteTag);

export default router;