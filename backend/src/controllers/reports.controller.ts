import { Request, Response } from 'express';
import reportsService from '../services/reports.service';
import logger from '../config/logger';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    const stats = await reportsService.getTicketStats(start, end);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
};

// Get ticket trends
export const getTicketTrends = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    const trends = await reportsService.getTicketTrends(start, end);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    logger.error('Error getting ticket trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket trends'
    });
  }
};

// Get agent performance
export const getAgentPerformance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    const performance = await reportsService.getAgentPerformance(start, end);
    
    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error getting agent performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent performance data'
    });
  }
};

// Get priority distribution
export const getPriorityDistribution = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    const distribution = await reportsService.getPriorityDistribution(start, end);
    
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    logger.error('Error getting priority distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get priority distribution'
    });
  }
};

// Get status distribution
export const getStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    const distribution = await reportsService.getStatusDistribution(start, end);
    
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    logger.error('Error getting status distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status distribution'
    });
  }
};

// Get SLA compliance
export const getSLACompliance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    const compliance = await reportsService.getSLACompliance(start, end);
    
    res.status(200).json({
      success: true,
      data: compliance
    });
  } catch (error) {
    logger.error('Error getting SLA compliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SLA compliance data'
    });
  }
};

// Export reports as CSV
export const exportReportsCSV = async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    let start: Date | undefined;
    let end: Date | undefined;
    
    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    }

    let data: any;
    let filename: string;
    let csvContent: string;

    switch (type) {
      case 'stats':
        data = await reportsService.getTicketStats(start, end);
        filename = 'ticket-stats.csv';
        csvContent = generateStatsCSV(data);
        break;
      case 'agent-performance':
        data = await reportsService.getAgentPerformance(start, end);
        filename = 'agent-performance.csv';
        csvContent = generateAgentPerformanceCSV(data);
        break;
      case 'priority-distribution':
        data = await reportsService.getPriorityDistribution(start, end);
        filename = 'priority-distribution.csv';
        csvContent = generateDistributionCSV(data, 'priority');
        break;
      case 'status-distribution':
        data = await reportsService.getStatusDistribution(start, end);
        filename = 'status-distribution.csv';
        csvContent = generateDistributionCSV(data, 'status');
        break;
      case 'sla-compliance':
        data = await reportsService.getSLACompliance(start, end);
        filename = 'sla-compliance.csv';
        csvContent = generateSLAComplianceCSV(data);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvContent);
  } catch (error) {
    logger.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV'
    });
  }
};

// Helper functions to generate CSV content
function generateStatsCSV(data: any): string {
  const headers = 'Metric,Value\n';
  const rows = [
    `Total Tickets,${data.totalTickets}`,
    `Open Tickets,${data.openTickets}`,
    `In Progress Tickets,${data.inProgressTickets}`,
    `Resolved Tickets,${data.resolvedTickets}`,
    `Closed Tickets,${data.closedTickets}`,
    `Average Resolution Time (hours),${data.avgResolutionTime.toFixed(2)}`
  ];
  return headers + rows.join('\n');
}

function generateAgentPerformanceCSV(data: any[]): string {
  const headers = 'Agent Name,Assigned Tickets,Resolved Tickets,Average Resolution Time (hours),Resolution Rate (%)\n';
  const rows = data.map(item => 
    `${item.agentName},${item.assignedTickets},${item.resolvedTickets},${item.avgResolutionTime.toFixed(2)},${item.resolutionRate.toFixed(2)}`
  );
  return headers + rows.join('\n');
}

function generateDistributionCSV(data: any[], type: string): string {
  const headers = `${type.charAt(0).toUpperCase() + type.slice(1)},Count\n`;
  const rows = data.map(item => 
    `${item[type]},${item.count}`
  );
  return headers + rows.join('\n');
}

function generateSLAComplianceCSV(data: any[]): string {
  const headers = 'Priority,Total Tickets,Met SLA,SLA Target (hours),Average Resolution Time (hours),Compliance Rate (%)\n';
  const rows = data.map(item => 
    `${item.priority},${item.totalTickets},${item.metSLA},${item.slaTarget},${item.avgResolutionTime.toFixed(2)},${item.complianceRate.toFixed(2)}`
  );
  return headers + rows.join('\n');
}