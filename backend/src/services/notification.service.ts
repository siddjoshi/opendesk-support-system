import Bull from 'bull';
import emailService from './email.service';
import User from '../models/user.model';
import Ticket from '../models/ticket.model';
import logger from '../config/logger';

export interface NotificationData {
  type: 'ticket_created' | 'ticket_updated' | 'ticket_assigned' | 'ticket_commented' | 'ticket_resolved' | 'ticket_closed';
  recipients: string[];
  ticketId: number;
  userId?: number;
  assignedToId?: number;
  oldStatus?: string;
  newStatus?: string;
  comment?: string;
  additionalData?: any;
}

class NotificationService {
  private emailQueue: Bull.Queue;

  constructor() {
    // Initialize Bull queue for email notifications
    this.emailQueue = new Bull('email notifications', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Process email notification jobs
    this.emailQueue.process(this.processEmailNotification.bind(this));
  }

  private async processEmailNotification(job: Bull.Job<NotificationData>): Promise<void> {
    const { type, recipients, ticketId, userId, assignedToId, oldStatus, newStatus, comment, additionalData } = job.data;

    try {
      // Get ticket details
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });

      if (!ticket) {
        logger.error(`Ticket not found for notification: ${ticketId}`);
        return;
      }

      // Send notifications to all recipients
      for (const email of recipients) {
        await this.sendNotificationEmail(type, email, ticket, {
          userId,
          assignedToId,
          oldStatus,
          newStatus,
          comment,
          ...additionalData,
        });
      }

      logger.info(`Processed ${type} notification for ticket ${ticketId} to ${recipients.length} recipients`);
    } catch (error) {
      logger.error(`Error processing email notification for ticket ${ticketId}:`, error);
      throw error;
    }
  }

  private async sendNotificationEmail(
    type: NotificationData['type'],
    email: string,
    ticket: any,
    data: any
  ): Promise<void> {
    const templateData = {
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      },
      creator: ticket.creator ? {
        name: ticket.creator.name,
        email: ticket.creator.email,
      } : null,
      assignedTo: ticket.assignedTo ? {
        name: ticket.assignedTo.name,
        email: ticket.assignedTo.email,
      } : null,
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      ...data,
    };

    const subjects = {
      ticket_created: `New Ticket Created: ${ticket.ticketNumber}`,
      ticket_updated: `Ticket Updated: ${ticket.ticketNumber}`,
      ticket_assigned: `Ticket Assigned: ${ticket.ticketNumber}`,
      ticket_commented: `New Comment on Ticket: ${ticket.ticketNumber}`,
      ticket_resolved: `Ticket Resolved: ${ticket.ticketNumber}`,
      ticket_closed: `Ticket Closed: ${ticket.ticketNumber}`,
    };

    const templateNames = {
      ticket_created: 'ticket-created',
      ticket_updated: 'ticket-updated',
      ticket_assigned: 'ticket-assigned',
      ticket_commented: 'ticket-commented',
      ticket_resolved: 'ticket-resolved',
      ticket_closed: 'ticket-closed',
    };

    await emailService.sendTemplateEmail(
      templateNames[type],
      email,
      subjects[type],
      templateData
    );
  }

  public async queueNotification(data: NotificationData): Promise<void> {
    try {
      await this.emailQueue.add(data, {
        delay: 0, // Send immediately, can be configured for batching
      });
      logger.info(`Queued ${data.type} notification for ticket ${data.ticketId}`);
    } catch (error) {
      logger.error('Error queuing notification:', error);
      // Fallback to direct email sending if queue fails
      await this.processEmailNotification({ data } as Bull.Job<NotificationData>);
    }
  }

  public async notifyTicketCreated(ticketId: number): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [{ model: User, as: 'creator' }],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      // Get all agents and admins to notify
      const agents = await User.findAll({
        where: { role: ['agent', 'admin'], isActive: true },
        attributes: ['email', 'emailNotifications'],
      });

      const recipients: string[] = [];

      // Filter agents based on their notification preferences
      for (const agent of agents) {
        if (agent.emailNotifications?.ticketCreated) {
          recipients.push(agent.email);
        }
      }

      // Also notify the ticket creator if they have notifications enabled
      if ((ticket as any).creator && ((ticket as any).creator as any).emailNotifications?.ticketCreated) {
        recipients.push((ticket as any).creator.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_created',
          recipients: [...new Set(recipients)], // Remove duplicates
          ticketId,
          userId: ticket.userId,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket created:', error);
    }
  }

  public async notifyTicketUpdated(ticketId: number, oldStatus: string, newStatus: string): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      const recipients: string[] = [];

      // Notify ticket creator if they have notifications enabled
      if ((ticket as any).creator && ((ticket as any).creator as any).emailNotifications?.ticketUpdated) {
        recipients.push((ticket as any).creator.email);
      }

      // Notify assigned agent if they have notifications enabled
      if ((ticket as any).assignedTo && ((ticket as any).assignedTo as any).emailNotifications?.ticketUpdated) {
        recipients.push((ticket as any).assignedTo.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_updated',
          recipients: [...new Set(recipients)],
          ticketId,
          oldStatus,
          newStatus,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket updated:', error);
    }
  }

  public async notifyTicketAssigned(ticketId: number, assignedToId: number): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      const recipients: string[] = [];

      // Notify ticket creator if they have notifications enabled
      if ((ticket as any).creator && ((ticket as any).creator as any).emailNotifications?.ticketAssigned) {
        recipients.push((ticket as any).creator.email);
      }

      // Notify assigned agent if they have notifications enabled
      if ((ticket as any).assignedTo && ((ticket as any).assignedTo as any).emailNotifications?.ticketAssigned) {
        recipients.push((ticket as any).assignedTo.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_assigned',
          recipients: [...new Set(recipients)],
          ticketId,
          assignedToId,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket assigned:', error);
    }
  }

  public async notifyTicketCommented(ticketId: number, comment: string, commenterId: number): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, as: 'creator' },
          { model: User, as: 'assignedTo' },
        ],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      const recipients: string[] = [];

      // Notify ticket creator (unless they're the commenter) if they have notifications enabled
      if ((ticket as any).creator && (ticket as any).creator.id !== commenterId && ((ticket as any).creator as any).emailNotifications?.ticketCommented) {
        recipients.push((ticket as any).creator.email);
      }

      // Notify assigned agent (unless they're the commenter) if they have notifications enabled
      if ((ticket as any).assignedTo && (ticket as any).assignedTo.id !== commenterId && ((ticket as any).assignedTo as any).emailNotifications?.ticketCommented) {
        recipients.push((ticket as any).assignedTo.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_commented',
          recipients: [...new Set(recipients)],
          ticketId,
          comment,
          userId: commenterId,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket commented:', error);
    }
  }

  public async notifyTicketResolved(ticketId: number): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [{ model: User, as: 'creator' }],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      const recipients: string[] = [];

      // Notify ticket creator if they have notifications enabled
      if ((ticket as any).creator && ((ticket as any).creator as any).emailNotifications?.ticketResolved) {
        recipients.push((ticket as any).creator.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_resolved',
          recipients,
          ticketId,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket resolved:', error);
    }
  }

  public async notifyTicketClosed(ticketId: number): Promise<void> {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [{ model: User, as: 'creator' }],
      });

      if (!ticket) {
        logger.error(`Ticket not found: ${ticketId}`);
        return;
      }

      const recipients: string[] = [];

      // Notify ticket creator if they have notifications enabled
      if ((ticket as any).creator && ((ticket as any).creator as any).emailNotifications?.ticketClosed) {
        recipients.push((ticket as any).creator.email);
      }

      if (recipients.length > 0) {
        await this.queueNotification({
          type: 'ticket_closed',
          recipients,
          ticketId,
        });
      }
    } catch (error) {
      logger.error('Error notifying ticket closed:', error);
    }
  }

  public async getQueueStats(): Promise<any> {
    try {
      const waiting = await this.emailQueue.getWaiting();
      const active = await this.emailQueue.getActive();
      const completed = await this.emailQueue.getCompleted();
      const failed = await this.emailQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return null;
    }
  }
}

export default new NotificationService();