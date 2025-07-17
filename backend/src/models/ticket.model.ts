import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

interface TicketAttributes {
  id?: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: number;
  assignedToId?: number | null;
  ticketNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TicketCreationAttributes extends TicketAttributes {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public userId!: number;
  public assignedToId!: number | null;
  public ticketNumber!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'on_hold', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'tickets',
    modelName: 'Ticket',
    hooks: {
      beforeCreate: (ticket: Ticket) => {
        // Generate ticket number format: TICK-YYYYMMDD-XXXX (XXXX is a random number)
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        ticket.ticketNumber = `TICK-${dateStr}-${random}`;
      },
    },
  }
);

// Define associations
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'creator' });
Ticket.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo' });

export default Ticket;
