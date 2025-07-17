import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Article from './article.model';
import User from './user.model';

interface ArticleViewAttributes {
  id?: number;
  articleId: number;
  userId?: number | null;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleViewCreationAttributes extends ArticleViewAttributes {}

class ArticleView extends Model<ArticleViewAttributes, ArticleViewCreationAttributes> implements ArticleViewAttributes {
  public id!: number;
  public articleId!: number;
  public userId!: number | null;
  public ipAddress!: string;
  public userAgent!: string;
  public viewedAt!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ArticleView.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Article,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'article_views',
    modelName: 'ArticleView',
    indexes: [
      {
        fields: ['articleId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['viewedAt'],
      },
    ],
  }
);

// Define associations
ArticleView.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
ArticleView.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Add reverse associations
Article.hasMany(ArticleView, { foreignKey: 'articleId', as: 'views' });
User.hasMany(ArticleView, { foreignKey: 'userId', as: 'articleViews' });

export default ArticleView;