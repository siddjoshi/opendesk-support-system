import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Category from './category.model';
import sanitizeHtml from 'sanitize-html';

interface ArticleAttributes {
  id?: number;
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  categoryId: number;
  authorId: number;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  viewCount: number;
  ratingCount: number;
  ratingSum: number;
  averageRating: number;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleCreationAttributes extends Omit<ArticleAttributes, 'id' | 'slug' | 'viewCount' | 'ratingCount' | 'ratingSum' | 'averageRating'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public slug!: string;
  public excerpt!: string;
  public categoryId!: number;
  public authorId!: number;
  public status!: 'draft' | 'published' | 'archived';
  public isPublic!: boolean;
  public viewCount!: number;
  public ratingCount!: number;
  public ratingSum!: number;
  public averageRating!: number;
  public publishedAt!: Date | null;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public setTags!: (tags: any[]) => Promise<void>;
  public getTags!: () => Promise<any[]>;
  public addTag!: (tag: any) => Promise<void>;
  public removeTag!: (tag: any) => Promise<void>;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ratingSum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'articles',
    modelName: 'Article',
    hooks: {
      beforeCreate: (article: Article) => {
        if (!article.slug) {
          article.slug = article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        if (!article.excerpt && article.content) {
          // Create excerpt from content (first 150 characters)
          const sanitizedContent = sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} });
          article.excerpt = sanitizedContent.length > 150 ? sanitizedContent.substring(0, 150) + '...' : sanitizedContent;
        }
        if (article.status === 'published' && !article.publishedAt) {
          article.publishedAt = new Date();
        }
      },
      beforeUpdate: (article: Article) => {
        if (article.changed('title') && !article.changed('slug')) {
          article.slug = article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        if (article.changed('content') && !article.changed('excerpt')) {
          const sanitizedContent = sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} });
          article.excerpt = sanitizedContent.length > 150 ? sanitizedContent.substring(0, 150) + '...' : sanitizedContent;
        }
        if (article.changed('status') && article.status === 'published' && !article.publishedAt) {
          article.publishedAt = new Date();
        }
      },
    },
  }
);

// Define associations
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Add reverse associations
Category.hasMany(Article, { foreignKey: 'categoryId', as: 'articles' });
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });

export default Article;