import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarIcon, DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { 
  TicketTrendsChart, 
  PriorityDistributionChart, 
  StatusDistributionChart,
  AgentPerformanceChart,
  SLAComplianceChart
} from '../components/charts/ReportCharts';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResolutionTime: number;
}

const ReportsDemo: React.FC = () => {
  // Mock data for demonstration
  const [stats] = useState<DashboardStats>({
    totalTickets: 156,
    openTickets: 23,
    inProgressTickets: 18,
    resolvedTickets: 98,
    closedTickets: 17,
    avgResolutionTime: 4.2
  });
  
  const [ticketTrends] = useState([
    { date: '2024-01-15', created: 8, resolved: 5 },
    { date: '2024-01-16', created: 12, resolved: 8 },
    { date: '2024-01-17', created: 6, resolved: 10 },
    { date: '2024-01-18', created: 15, resolved: 7 },
    { date: '2024-01-19', created: 9, resolved: 12 },
    { date: '2024-01-20', created: 11, resolved: 9 },
    { date: '2024-01-21', created: 7, resolved: 11 },
  ]);
  
  const [priorityDistribution] = useState([
    { priority: 'urgent', count: 8 },
    { priority: 'high', count: 32 },
    { priority: 'medium', count: 78 },
    { priority: 'low', count: 38 },
  ]);
  
  const [statusDistribution] = useState([
    { status: 'open', count: 23 },
    { status: 'in_progress', count: 18 },
    { status: 'on_hold', count: 5 },
    { status: 'resolved', count: 98 },
    { status: 'closed', count: 17 },
  ]);
  
  const [agentPerformance] = useState([
    { agentName: 'John Doe', assignedTickets: 45, resolvedTickets: 38, resolutionRate: 84.4 },
    { agentName: 'Jane Smith', assignedTickets: 52, resolvedTickets: 47, resolutionRate: 90.4 },
    { agentName: 'Mike Johnson', assignedTickets: 38, resolvedTickets: 32, resolutionRate: 84.2 },
    { agentName: 'Sarah Wilson', assignedTickets: 41, resolvedTickets: 35, resolutionRate: 85.4 },
  ]);
  
  const [slaCompliance] = useState([
    { priority: 'urgent', complianceRate: 95.2 },
    { priority: 'high', complianceRate: 87.8 },
    { priority: 'medium', complianceRate: 92.3 },
    { priority: 'low', complianceRate: 88.9 },
  ]);
  
  // Date range state
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${Math.round(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Reports Dashboard
          </h1>
          <p className="text-gray-600">Comprehensive insights into support operations</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">From:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">To:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">Total Tickets</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalTickets}</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">Open Tickets</div>
            <div className="mt-1 text-3xl font-semibold text-yellow-600">{stats.openTickets}</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">In Progress</div>
            <div className="mt-1 text-3xl font-semibold text-blue-600">{stats.inProgressTickets}</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">Resolved</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.resolvedTickets}</div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">Avg. Resolution Time</div>
            <div className="mt-1 text-3xl font-semibold text-indigo-600">{formatTime(stats.avgResolutionTime)}</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ticket Trends</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <TicketTrendsChart data={ticketTrends} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">SLA Compliance</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <SLAComplianceChart data={slaCompliance} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Priority Distribution</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <PriorityDistributionChart data={priorityDistribution} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <StatusDistributionChart data={statusDistribution} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Agent Performance</h3>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          <AgentPerformanceChart data={agentPerformance} />
        </div>
      </div>

      {/* Export All Button */}
      <div className="flex justify-center">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export All Reports
        </button>
      </div>
    </div>
  );
};

export default ReportsDemo;