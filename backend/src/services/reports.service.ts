import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import Ticket from '../models/ticket.model';
import User from '../models/user.model';
import logger from '../config/logger';
import { USER_ROLES, SLA_TARGETS, TICKET_STATUSES } from '../config/constants';

interface TicketStatsResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResolutionTime: number;
}

interface TicketTrendData {
  date: string;
  created: number;
  resolved: number;
}

interface AgentPerformanceData {
  agentId: number;
  agentName: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  resolutionRate: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

class ReportsService {
  /**
   * Get basic ticket statistics
   */
  public async getTicketStats(startDate?: Date, endDate?: Date): Promise<TicketStatsResponse> {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
        Ticket.count({ where: whereClause }),
        Ticket.count({ where: { ...whereClause, status: TICKET_STATUSES.OPEN } }),
        Ticket.count({ where: { ...whereClause, status: TICKET_STATUSES.IN_PROGRESS } }),
        Ticket.count({ where: { ...whereClause, status: TICKET_STATUSES.RESOLVED } }),
        Ticket.count({ where: { ...whereClause, status: TICKET_STATUSES.CLOSED } })
      ]);

      // Calculate average resolution time for resolved tickets
      const avgResolutionTime = await this.calculateAvgResolutionTime(startDate, endDate);

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        avgResolutionTime
      };
    } catch (error) {
      logger.error('Error getting ticket stats:', error);
      throw error;
    }
  }

  /**
   * Get ticket trend data for charts
   */
  public async getTicketTrends(startDate: Date, endDate: Date): Promise<TicketTrendData[]> {
    try {
      const query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as created,
          COUNT(CASE WHEN status = '${TICKET_STATUSES.RESOLVED}' OR status = '${TICKET_STATUSES.CLOSED}' THEN 1 END) as resolved
        FROM tickets 
        WHERE created_at BETWEEN :startDate AND :endDate
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { startDate, endDate }
      }) as any[];

      return results.map(row => ({
        date: row.date,
        created: parseInt(row.created),
        resolved: parseInt(row.resolved)
      }));
    } catch (error) {
      logger.error('Error getting ticket trends:', error);
      throw error;
    }
  }

  /**
   * Get agent performance metrics
   */
  public async getAgentPerformance(startDate?: Date, endDate?: Date): Promise<AgentPerformanceData[]> {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const query = `
        SELECT 
          u.id as agent_id,
          u.name as agent_name,
          COUNT(t.id) as assigned_tickets,
          COUNT(CASE WHEN t.status = '${TICKET_STATUSES.RESOLVED}' OR t.status = '${TICKET_STATUSES.CLOSED}' THEN 1 END) as resolved_tickets,
          COALESCE(
            AVG(
              CASE 
                WHEN t.status = '${TICKET_STATUSES.RESOLVED}' OR t.status = '${TICKET_STATUSES.CLOSED}' 
                THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600
              END
            ), 0
          ) as avg_resolution_time
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_to_id
        WHERE u.role = '${USER_ROLES.AGENT}'
        ${startDate && endDate ? 'AND t.created_at BETWEEN :startDate AND :endDate' : ''}
        GROUP BY u.id, u.name
        ORDER BY resolved_tickets DESC
      `;

      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: startDate && endDate ? { startDate, endDate } : {}
      }) as any[];

      return results.map(row => ({
        agentId: row.agent_id,
        agentName: row.agent_name,
        assignedTickets: parseInt(row.assigned_tickets) || 0,
        resolvedTickets: parseInt(row.resolved_tickets) || 0,
        avgResolutionTime: parseFloat(row.avg_resolution_time) || 0,
        resolutionRate: row.assigned_tickets > 0 ? 
          (parseInt(row.resolved_tickets) / parseInt(row.assigned_tickets)) * 100 : 0
      }));
    } catch (error) {
      logger.error('Error getting agent performance:', error);
      throw error;
    }
  }

  /**
   * Get priority distribution
   */
  public async getPriorityDistribution(startDate?: Date, endDate?: Date): Promise<PriorityDistribution[]> {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const results = await Ticket.findAll({
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['priority'],
        raw: true
      }) as any[];

      return results.map(row => ({
        priority: row.priority,
        count: parseInt(row.count)
      }));
    } catch (error) {
      logger.error('Error getting priority distribution:', error);
      throw error;
    }
  }

  /**
   * Get status distribution
   */
  public async getStatusDistribution(startDate?: Date, endDate?: Date): Promise<StatusDistribution[]> {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const results = await Ticket.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['status'],
        raw: true
      }) as any[];

      return results.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      }));
    } catch (error) {
      logger.error('Error getting status distribution:', error);
      throw error;
    }
  }

  /**
   * Calculate average resolution time in hours
   */
  private async calculateAvgResolutionTime(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const whereClause: any = {
        status: {
          [Op.in]: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED]
        }
      };
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const query = `
        SELECT 
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_hours
        FROM tickets 
        WHERE status IN ('${TICKET_STATUSES.RESOLVED}', '${TICKET_STATUSES.CLOSED}')
        ${startDate && endDate ? 'AND created_at BETWEEN :startDate AND :endDate' : ''}
      `;

      const result = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: startDate && endDate ? { startDate, endDate } : {}
      }) as any[];

      return parseFloat(result[0]?.avg_hours) || 0;
    } catch (error) {
      logger.error('Error calculating avg resolution time:', error);
      return 0;
    }
  }

  /**
   * Get SLA compliance data
   */
  public async getSLACompliance(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // Use configurable SLA targets from constants
      const slaTargets = SLA_TARGETS;

      const whereClause: any = {
        status: {
          [Op.in]: [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED]
        }
      };
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [startDate, endDate]
        };
      }

      const query = `
        SELECT 
          priority,
          COUNT(*) as total_tickets,
          COUNT(
            CASE 
              WHEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 <= 
                CASE priority 
                  WHEN 'urgent' THEN 4 
                  WHEN 'high' THEN 8 
                  WHEN 'medium' THEN 24 
                  WHEN 'low' THEN 72 
                END
              THEN 1 
            END
          ) as met_sla,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_resolution_time
        FROM tickets 
        WHERE status IN ('resolved', 'closed')
        ${startDate && endDate ? 'AND created_at BETWEEN :startDate AND :endDate' : ''}
        GROUP BY priority
      `;

      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: startDate && endDate ? { startDate, endDate } : {}
      }) as any[];

      return results.map(row => ({
        priority: row.priority,
        totalTickets: parseInt(row.total_tickets),
        metSLA: parseInt(row.met_sla),
        slaTarget: slaTargets[row.priority as keyof typeof slaTargets],
        avgResolutionTime: parseFloat(row.avg_resolution_time),
        complianceRate: (parseInt(row.met_sla) / parseInt(row.total_tickets)) * 100
      }));
    } catch (error) {
      logger.error('Error getting SLA compliance:', error);
      throw error;
    }
  }
}

export default new ReportsService();