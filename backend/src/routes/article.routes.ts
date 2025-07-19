import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  rateArticle,
  searchArticles,
  getRelatedArticles,
} from '../controllers/article.controller';
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
const articleValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('tagIds must be an array'),
  body('tagIds.*')
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a positive integer'),
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Feedback must be less than 1000 characters'),
  body('isHelpful')
    .optional()
    .isBoolean()
    .withMessage('isHelpful must be a boolean'),
];

// Public routes (no authentication required)
router.get('/search', searchArticles);
router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/:id/related', getRelatedArticles);

// Protected routes (authentication required)
router.post('/', authenticate, articleValidation, validate, createArticle);
router.put('/:id', authenticate, articleValidation, validate, updateArticle);
router.delete('/:id', authenticate, deleteRateLimiter, deleteArticle);
router.post('/:id/rate', authenticate, ratingValidation, validate, rateArticle);

export default router;