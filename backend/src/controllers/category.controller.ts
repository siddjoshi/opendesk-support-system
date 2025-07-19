import { Request, Response } from 'express';
import Category from '../models/category.model';
import Article from '../models/article.model';
import logger from '../config/logger';

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parentId = null, sortOrder = 0 } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to create categories (admin only)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can create categories.' });
    }

    // Create the category
    const category = await Category.create({
      name,
      description,
      parentId,
      sortOrder,
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const parentId = req.query.parentId as string;

    const whereClause: any = {};
    
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (parentId !== undefined) {
      whereClause.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    const categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    // Add article count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const articleCount = await Article.count({
          where: { 
            categoryId: category.id,
            status: 'published',
            isPublic: true,
          },
        });

        return {
          ...category.toJSON(),
          articleCount,
        };
      })
    );

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID or slug
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const category = await Category.findOne({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get article count for this category
    const articleCount = await Article.count({
      where: { 
        categoryId: category.id,
        status: 'published',
        isPublic: true,
      },
    });

    res.json({
      category: {
        ...category.toJSON(),
        articleCount,
      },
    });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, isActive, sortOrder } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to update categories (admin only)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can update categories.' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for circular reference if parentId is being updated
    if (parentId) {
      const checkCircularReference = async (currentId: number, targetId: number): Promise<boolean> => {
        if (currentId === targetId) {
          return true;
        }
        const parentCategory = await Category.findByPk(currentId, { attributes: ['parentId'] });
        if (parentCategory?.parentId) {
          return checkCircularReference(parentCategory.parentId, targetId);
        }
        return false;
      };

      const isCircular = await checkCircularReference(parseInt(parentId), category.id);
      if (isCircular) {
        return res.status(400).json({ message: 'Circular reference detected in category hierarchy' });
      }
    }

    // Update the category
    await category.update({
      name,
      description,
      parentId,
      isActive,
      sortOrder,
    });

    // Fetch the updated category with associations
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    logger.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has permission to delete categories (admin only)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete categories.' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has articles
    const articleCount = await Article.count({ where: { categoryId: id } });
    if (articleCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with articles. Please move or delete articles first.' 
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.count({ where: { parentId: id } });
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Please move or delete subcategories first.' 
      });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category tree (hierarchical structure)
export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const whereClause: any = { parentId: null };
    
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const buildCategoryTree = async (categories: any[]): Promise<any[]> => {
      const result = [];
      
      for (const category of categories) {
        const subcategories = await Category.findAll({
          where: { 
            parentId: category.id,
            ...(includeInactive ? {} : { isActive: true }),
          },
          order: [['sortOrder', 'ASC'], ['name', 'ASC']],
        });

        const articleCount = await Article.count({
          where: { 
            categoryId: category.id,
            status: 'published',
            isPublic: true,
          },
        });

        result.push({
          ...category.toJSON(),
          articleCount,
          subcategories: subcategories.length > 0 ? await buildCategoryTree(subcategories) : [],
        });
      }
      
      return result;
    };

    const rootCategories = await Category.findAll({
      where: whereClause,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    const categoryTree = await buildCategoryTree(rootCategories);

    res.json({ categories: categoryTree });
  } catch (error) {
    logger.error('Error fetching category tree:', error);
    res.status(500).json({ message: 'Server error' });
  }
};