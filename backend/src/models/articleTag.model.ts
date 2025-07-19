import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Article from './article.model';
import Tag from './tag.model';

// Junction table for many-to-many relationship between Articles and Tags
interface ArticleTagAttributes {
  id?: number;
  articleId: number;
  tagId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleTagCreationAttributes extends ArticleTagAttributes {}

class ArticleTag extends Model<ArticleTagAttributes, ArticleTagCreationAttributes> implements ArticleTagAttributes {
  public id!: number;
  public articleId!: number;
  public tagId!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ArticleTag.init(
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
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tag,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'article_tags',
    modelName: 'ArticleTag',
    indexes: [
      {
        unique: true,
        fields: ['articleId', 'tagId'],
      },
    ],
  }
);

// Define many-to-many associations
Article.belongsToMany(Tag, { through: ArticleTag, foreignKey: 'articleId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Article, { through: ArticleTag, foreignKey: 'tagId', otherKey: 'articleId', as: 'articles' });

export default ArticleTag;