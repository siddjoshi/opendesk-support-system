import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface TagAttributes {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TagCreationAttributes extends Omit<TagAttributes, 'id' | 'slug' | 'isActive'> {
  isActive?: boolean;
}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public description!: string;
  public color!: string;
  public isActive!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public countArticles!: (options?: any) => Promise<number>;
  public getArticles!: (options?: any) => Promise<any[]>;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7), // Hex color code
      allowNull: true,
      defaultValue: '#3B82F6', // Default blue color
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'tags',
    modelName: 'Tag',
    hooks: {
      beforeCreate: (tag: Tag) => {
        if (!tag.slug) {
          tag.slug = tag.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
      },
      beforeUpdate: (tag: Tag) => {
        if (tag.changed('name') && !tag.changed('slug')) {
          tag.slug = tag.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
      },
    },
  }
);

export default Tag;