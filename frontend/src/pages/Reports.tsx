import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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

interface TicketTrend {
  date: string;
  created: number;
  resolved: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface AgentPerformance {
  agentId: number;
  agentName: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  resolutionRate: number;
}

interface SLAComplianceData {
  priority: string;
  totalTickets: number;
  compliantTickets: number;
  complianceRate: number;
  targetHours: number;
}

const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    avgResolutionTime: 0
  });
  
  const [ticketTrends, setTicketTrends] = useState<TicketTrend[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [slaCompliance, setSlaCompliance] = useState<SLAComplianceData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date range state
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startDate: startOfDay(new Date(startDate)).toISOString(),
            endDate: endOfDay(new Date(endDate)).toISOString(),
          },
        };

        // Fetch all report data in parallel
        const [
          statsResponse,
          trendsResponse,
          priorityResponse,
          statusResponse,
          agentResponse,
          slaResponse
        ] = await Promise.all([
          axios.get('/api/reports/stats', config),
          axios.get('/api/reports/trends', config),
          axios.get('/api/reports/priority-distribution', config),
          axios.get('/api/reports/status-distribution', config),
          axios.get('/api/reports/agent-performance', config),
          axios.get('/api/reports/sla-compliance', config)
        ]);

        setStats(statsResponse.data.data);
        setTicketTrends(trendsResponse.data.data);
        setPriorityDistribution(priorityResponse.data.data);
        setStatusDistribution(statusResponse.data.data);
        setAgentPerformance(agentResponse.data.data);
        setSlaCompliance(slaResponse.data.data);
        
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching report data:', err.message);
          setError(err.message || 'Failed to load report data');
        } else if (err && typeof err === 'object' && 'response' in err) {
          // Handle axios errors
          const axiosError = err as any;
          console.error('Error fetching report data:', axiosError);
          setError(axiosError.response?.data?.message || 'Failed to load report data');
        } else {
          console.error('Unexpected error:', err);
          setError('Failed to load report data');
        }
        setLoading(false);
      }
    };

    fetchReportData();
  }, [startDate, endDate]);

  const exportCSV = async (type: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type,
          startDate: startOfDay(new Date(startDate)).toISOString(),
          endDate: endOfDay(new Date(endDate)).toISOString(),
        },
        responseType: 'blob' as const,
      };

      const response = await axios.get('/api/reports/export/csv', config);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${Math.round(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

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
            <button
              onClick={() => exportCSV('trends')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          {ticketTrends.length > 0 ? (
            <TicketTrendsChart data={ticketTrends} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">SLA Compliance</h3>
            <button
              onClick={() => exportCSV('sla-compliance')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          {slaCompliance.length > 0 ? (
            <SLAComplianceChart data={slaCompliance} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Priority Distribution</h3>
            <button
              onClick={() => exportCSV('priority-distribution')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          {priorityDistribution.length > 0 ? (
            <PriorityDistributionChart data={priorityDistribution} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
            <button
              onClick={() => exportCSV('status-distribution')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          {statusDistribution.length > 0 ? (
            <StatusDistributionChart data={statusDistribution} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Agent Performance</h3>
            <button
              onClick={() => exportCSV('agent-performance')}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          {agentPerformance.length > 0 ? (
            <AgentPerformanceChart data={agentPerformance} />
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Export All Button */}
      <div className="flex justify-center">
        <button
          onClick={() => exportCSV('stats')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Export All Reports
        </button>
      </div>
    </div>
  );
};

export default Reports;