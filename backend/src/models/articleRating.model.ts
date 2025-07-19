import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Article from './article.model';
import User from './user.model';

interface ArticleRatingAttributes {
  id?: number;
  articleId: number;
  userId: number;
  rating: number;
  feedback?: string;
  isHelpful: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleRatingCreationAttributes extends ArticleRatingAttributes {}

class ArticleRating extends Model<ArticleRatingAttributes, ArticleRatingCreationAttributes> implements ArticleRatingAttributes {
  public id!: number;
  public articleId!: number;
  public userId!: number;
  public rating!: number;
  public feedback!: string;
  public isHelpful!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ArticleRating.init(
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
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isHelpful: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'article_ratings',
    modelName: 'ArticleRating',
    indexes: [
      {
        unique: true,
        fields: ['articleId', 'userId'],
      },
    ],
  }
);

// Define associations
ArticleRating.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });
ArticleRating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Add reverse associations
Article.hasMany(ArticleRating, { foreignKey: 'articleId', as: 'ratings' });
User.hasMany(ArticleRating, { foreignKey: 'userId', as: 'articleRatings' });

export default ArticleRating;