import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface TicketTrendsChartProps {
  data: Array<{
    date: string;
    created: number;
    resolved: number;
  }>;
}

export const TicketTrendsChart: React.FC<TicketTrendsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Created',
        data: data.map(item => item.created),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Resolved',
        data: data.map(item => item.resolved),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Ticket Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

interface PriorityDistributionChartProps {
  data: Array<{
    priority: string;
    count: number;
  }>;
}

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({ data }) => {
  const priorityColors = {
    urgent: 'rgba(239, 68, 68, 0.8)',
    high: 'rgba(245, 158, 11, 0.8)',
    medium: 'rgba(59, 130, 246, 0.8)',
    low: 'rgba(34, 197, 94, 0.8)',
  };

  const chartData = {
    labels: data.map(item => item.priority.charAt(0).toUpperCase() + item.priority.slice(1)),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => priorityColors[item.priority as keyof typeof priorityColors] || 'rgba(107, 114, 128, 0.8)'),
        borderColor: data.map(item => priorityColors[item.priority as keyof typeof priorityColors]?.replace('0.8', '1') || 'rgba(107, 114, 128, 1)'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Priority Distribution',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

interface StatusDistributionChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
  const statusColors = {
    open: 'rgba(245, 158, 11, 0.8)',
    in_progress: 'rgba(59, 130, 246, 0.8)',
    on_hold: 'rgba(107, 114, 128, 0.8)',
    resolved: 'rgba(34, 197, 94, 0.8)',
    closed: 'rgba(75, 85, 99, 0.8)',
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const chartData = {
    labels: data.map(item => formatStatus(item.status)),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => statusColors[item.status as keyof typeof statusColors] || 'rgba(107, 114, 128, 0.8)'),
        borderColor: data.map(item => statusColors[item.status as keyof typeof statusColors]?.replace('0.8', '1') || 'rgba(107, 114, 128, 1)'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Status Distribution',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

interface AgentPerformanceChartProps {
  data: Array<{
    agentName: string;
    assignedTickets: number;
    resolvedTickets: number;
    resolutionRate: number;
  }>;
}

export const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.agentName),
    datasets: [
      {
        label: 'Assigned Tickets',
        data: data.map(item => item.assignedTickets),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Resolved Tickets',
        data: data.map(item => item.resolvedTickets),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Agent Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

interface SLAComplianceChartProps {
  data: Array<{
    priority: string;
    complianceRate: number;
  }>;
}

export const SLAComplianceChart: React.FC<SLAComplianceChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.priority.charAt(0).toUpperCase() + item.priority.slice(1)),
    datasets: [
      {
        label: 'SLA Compliance Rate (%)',
        data: data.map(item => item.complianceRate),
        backgroundColor: data.map(item => 
          item.complianceRate >= 90 ? 'rgba(34, 197, 94, 0.8)' :
          item.complianceRate >= 70 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: data.map(item => 
          item.complianceRate >= 90 ? 'rgba(34, 197, 94, 1)' :
          item.complianceRate >= 70 ? 'rgba(245, 158, 11, 1)' :
          'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'SLA Compliance by Priority',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};