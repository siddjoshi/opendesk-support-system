import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  created: string;
  requester: string;
  assignee: string | null;
  updatedAt: string;
}

const TicketList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  console.log('Current user role:', user?.role); // Keep user for potential future use
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // In a real app, you would fetch this from your API with filters
        // For now, we'll simulate some data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockTickets: Ticket[] = [
          { id: 1, title: 'Cannot login to the application', status: 'Open', priority: 'High', created: '2023-08-25', requester: 'John Doe', assignee: null, updatedAt: '2023-08-25' },
          { id: 2, title: 'Error when uploading files', status: 'In Progress', priority: 'Medium', created: '2023-08-24', requester: 'Jane Smith', assignee: 'Support Agent', updatedAt: '2023-08-26' },
          { id: 3, title: 'Feature request: Export to PDF', status: 'Open', priority: 'Low', created: '2023-08-23', requester: 'Mike Johnson', assignee: null, updatedAt: '2023-08-23' },
          { id: 4, title: 'Dashboard shows incorrect data', status: 'Resolved', priority: 'High', created: '2023-08-21', requester: 'Sarah Williams', assignee: 'Tech Lead', updatedAt: '2023-08-24' },
          { id: 5, title: 'Cannot reset password', status: 'Open', priority: 'Medium', created: '2023-08-20', requester: 'Alex Thompson', assignee: null, updatedAt: '2023-08-20' },
        ];
        
        // Apply filters
        let filteredTickets = mockTickets;
        
        if (statusFilter !== 'all') {
          filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
        }
        
        if (priorityFilter !== 'all') {
          filteredTickets = filteredTickets.filter(ticket => ticket.priority === priorityFilter);
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.title.toLowerCase().includes(searchLower) || 
            ticket.requester.toLowerCase().includes(searchLower)
          );
        }
        
        setTickets(filteredTickets);
        setTotalPages(Math.ceil(filteredTickets.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter, priorityFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-orange-500';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const paginatedTickets = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md mb-4">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
        <button
          onClick={() => navigate('/tickets/new')}
          className="btn-primary"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Ticket
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-grow">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                placeholder="Search tickets..."
                className="form-input pl-10 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            <select
              className="form-input py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <select
              className="form-input py-1"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tickets table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tickets found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.created}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.requester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.assignee || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, tickets.length)}
                  </span>{' '}
                  of <span className="font-medium">{tickets.length}</span> tickets
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
