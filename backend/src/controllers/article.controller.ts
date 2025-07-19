import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Article from '../models/article.model';
import Category from '../models/category.model';
import Tag from '../models/tag.model';
import User from '../models/user.model';
import ArticleRating from '../models/articleRating.model';
import ArticleView from '../models/articleView.model';
import logger from '../config/logger';

// Create a new article
export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId, status = 'draft', isPublic = true, tagIds = [] } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to create articles (agent or admin)
    if (req.user?.role === 'customer') {
      return res.status(403).json({ message: 'Access denied. Only agents and admins can create articles.' });
    }

    // Create the article
    const article = await Article.create({
      title,
      content,
      categoryId,
      authorId,
      status,
      isPublic,
    });

    // Add tags if provided
    if (tagIds.length > 0) {
      const tags = await Tag.findAll({ where: { id: tagIds } });
      await article.setTags(tags);
    }

    // Fetch the created article with associations
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
      ],
    });

    res.status(201).json({
      message: 'Article created successfully',
      article: createdArticle,
    });
  } catch (error) {
    logger.error('Error creating article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all articles with filtering and pagination
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId as string;
    const tagId = req.query.tagId as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const whereClause: any = {};
    const includeClause: any[] = [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
    ];

    // Filter by category
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    } else {
      // Default to published articles for non-admin users
      if (req.user?.role === 'customer') {
        whereClause.status = 'published';
        whereClause.isPublic = true;
      }
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filter by tag
    if (tagId) {
      includeClause.push({
        model: Tag,
        as: 'tags',
        where: { id: tagId },
        attributes: ['id', 'name', 'slug', 'color'],
      });
    }

    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    logger.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get article by ID or slug
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const article = await Article.findOne({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user has permission to view the article
    if (!req.user || req.user.role === 'customer' && (!article.isPublic || article.status !== 'published')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Track article view
    await trackArticleView(article.id, req);

    // Get user's rating if authenticated
    let userRating = null;
    if (req.user?.id) {
      userRating = await ArticleRating.findOne({
        where: { articleId: article.id, userId: req.user.id },
      });
    }

    res.json({
      article,
      userRating,
    });
  } catch (error) {
    logger.error('Error fetching article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an article
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, status, isPublic, tagIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user has permission to update the article
    if (req.user?.role === 'customer' || (req.user?.role === 'agent' && article.authorId !== userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the article
    await article.update({
      title,
      content,
      categoryId,
      status,
      isPublic,
    });

    // Update tags if provided
    if (tagIds) {
      const tags = await Tag.findAll({ where: { id: tagIds } });
      await article.setTags(tags);
    }

    // Fetch the updated article with associations
    const updatedArticle = await Article.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
      ],
    });

    res.json({
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error) {
    logger.error('Error updating article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an article
export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user has permission to delete the article
    if (req.user?.role === 'customer' || (req.user?.role === 'agent' && article.authorId !== userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await article.destroy();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    logger.error('Error deleting article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate an article
export const rateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback, isHelpful = true } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user has already rated this article
    const existingRating = await ArticleRating.findOne({
      where: { articleId: id, userId },
    });

    if (existingRating) {
      // Update existing rating
      await existingRating.update({ rating, feedback, isHelpful });
    } else {
      // Create new rating
      await ArticleRating.create({
        articleId: parseInt(id),
        userId,
        rating,
        feedback,
        isHelpful,
      });
    }

    // Update article rating statistics
    await updateArticleRatingStats(parseInt(id));

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    logger.error('Error rating article:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search articles
export const searchArticles = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const whereClause: any = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { content: { [Op.iLike]: `%${q}%` } },
        { excerpt: { [Op.iLike]: `%${q}%` } },
      ],
    };

    // Filter by public articles for customers
    if (req.user?.role === 'customer') {
      whereClause.status = 'published';
      whereClause.isPublic = true;
    }

    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
      ],
      order: [['averageRating', 'DESC'], ['viewCount', 'DESC']],
      limit,
      offset,
    });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
      query: q,
    });
  } catch (error) {
    logger.error('Error searching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get related articles
export const getRelatedArticles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const article = await Article.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags' },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Get articles from the same category or with similar tags
    const relatedArticles = await Article.findAll({
      where: {
        id: { [Op.ne]: id },
        status: 'published',
        isPublic: true,
        [Op.or]: [
          { categoryId: article.categoryId },
          // This is a simplified approach - in a real app, you'd want more sophisticated related article logic
        ],
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug', 'color'] },
      ],
      order: [['averageRating', 'DESC'], ['viewCount', 'DESC']],
      limit,
    });

    res.json({ relatedArticles });
  } catch (error) {
    logger.error('Error fetching related articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to track article views
async function trackArticleView(articleId: number, req: Request) {
  try {
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || '';

    await ArticleView.create({
      articleId,
      userId,
      ipAddress,
      userAgent,
      viewedAt: new Date(),
    });

    // Increment view count
    await Article.increment('viewCount', { where: { id: articleId } });
  } catch (error) {
    logger.error('Error tracking article view:', error);
  }
}

// Helper function to update article rating statistics
async function updateArticleRatingStats(articleId: number) {
  try {
    const ratings = await ArticleRating.findAll({
      where: { articleId },
      attributes: ['rating'],
    });

    const ratingCount = ratings.length;
    const ratingSum = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    await Article.update(
      { ratingCount, ratingSum, averageRating },
      { where: { id: articleId } }
    );
  } catch (error) {
    logger.error('Error updating article rating stats:', error);
  }
}