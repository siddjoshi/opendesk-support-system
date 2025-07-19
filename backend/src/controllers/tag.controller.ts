import { Request, Response } from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import Tag from '../models/tag.model';
import Article from '../models/article.model';
import logger from '../config/logger';

// Create a new tag
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, description, color = '#3B82F6' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to create tags (agent or admin)
    if (req.user?.role === 'customer') {
      return res.status(403).json({ message: 'Access denied. Only agents and admins can create tags.' });
    }

    // Create the tag
    const tag = await Tag.create({
      name,
      description,
      color,
    });

    res.status(201).json({
      message: 'Tag created successfully',
      tag,
    });
  } catch (error) {
    logger.error('Error creating tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const search = req.query.search as string;

    const whereClause: any = {};
    
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    const tags = await Tag.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    // Add article count for each tag
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const articleCount = await tag.countArticles({
          where: { 
            status: 'published',
            isPublic: true,
          },
        });

        return {
          ...tag.toJSON(),
          articleCount,
        };
      })
    );

    res.json({ tags: tagsWithCounts });
  } catch (error) {
    logger.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tag by ID or slug
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const tag = await Tag.findOne({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Get article count for this tag
    const articleCount = await tag.countArticles({
      where: { 
        status: 'published',
        isPublic: true,
      },
    });

    res.json({
      tag: {
        ...tag.toJSON(),
        articleCount,
      },
    });
  } catch (error) {
    logger.error('Error fetching tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, isActive } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to update tags (agent or admin)
    if (req.user?.role === 'customer') {
      return res.status(403).json({ message: 'Access denied. Only agents and admins can update tags.' });
    }

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Update the tag
    await tag.update({
      name,
      description,
      color,
      isActive,
    });

    res.json({
      message: 'Tag updated successfully',
      tag,
    });
  } catch (error) {
    logger.error('Error updating tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to delete tags (admin only)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete tags.' });
    }

    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Check if tag has articles
    const articleCount = await tag.countArticles();
    if (articleCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tag with articles. Please remove the tag from articles first.' 
      });
    }

    await tag.destroy();

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get popular tags
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const tags = await Tag.findAll({
      where: { isActive: true },
      include: [
        {
          model: Article,
          as: 'articles',
          where: { 
            status: 'published',
            isPublic: true,
          },
          attributes: [],
          required: true,
        },
      ],
      attributes: [
        'id',
        'name',
        'slug',
        'color',
        [sequelize.fn('COUNT', sequelize.col('articles.id')), 'articleCount'],
      ],
      group: ['Tag.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('articles.id')), 'DESC']],
      limit,
    });

    res.json({ tags });
  } catch (error) {
    logger.error('Error fetching popular tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
};