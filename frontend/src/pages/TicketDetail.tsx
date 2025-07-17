import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftIcon, 
  PaperClipIcon, 
  ArrowLeftIcon,
  UserCircleIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created: string;
  requester: {
    id: number;
    name: string;
    email: string;
  };
  assignee: {
    id: number;
    name: string;
  } | null;
  category: string;
  comments: Array<{
    id: number;
    text: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  attachments: Array<{
    id: number;
    filename: string;
    url: string;
    contentType: string;
    createdAt: string;
  }>;
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // In a real app, you would fetch this from your API
        // For now, we'll simulate some data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock ticket data
        const mockTicket: Ticket = {
          id: parseInt(id || '0'),
          title: 'Cannot login to the application',
          description: 'I am trying to log in to the application but keep receiving an "Invalid credentials" error even though I am sure my password is correct. I have tried resetting my password but still face the same issue.',
          status: 'Open',
          priority: 'High',
          created: '2023-08-25T14:30:00Z',
          requester: {
            id: 101,
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          assignee: null,
          category: 'Authentication',
          comments: [
            {
              id: 201,
              text: 'I have tried clearing cookies and using a different browser, but the issue persists.',
              createdAt: '2023-08-25T15:45:00Z',
              user: {
                id: 101,
                name: 'John Doe'
              }
            },
            {
              id: 202,
              text: 'Thank you for reporting this issue. Could you please tell us which browser and version you are using?',
              createdAt: '2023-08-25T16:20:00Z',
              user: {
                id: 201,
                name: 'Support Agent'
              }
            }
          ],
          attachments: [
            {
              id: 301,
              filename: 'error_screenshot.png',
              url: '#',
              contentType: 'image/png',
              createdAt: '2023-08-25T14:35:00Z'
            }
          ]
        };
        
        setTicket(mockTicket);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details');
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      // In a real app, you would send this to your API
      // For now, we'll just simulate adding the comment locally
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state with new comment
      if (ticket) {
        const newComment = {
          id: Date.now(),
          text: commentText,
          createdAt: new Date().toISOString(),
          user: {
            id: user?.id || 0,
            name: user?.name || 'Current User'
          }
        };
        
        setTicket({
          ...ticket,
          comments: [...ticket.comments, newComment]
        });
        
        // Clear form
        setCommentText('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    
    try {
      // In a real app, you would send this to your API
      // For now, we'll just simulate updating the status locally
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      if (ticket) {
        setTicket({
          ...ticket,
          status: newStatus,
          comments: [
            ...ticket.comments,
            {
              id: Date.now(),
              text: `Status changed to ${newStatus}`,
              createdAt: new Date().toISOString(),
              user: {
                id: user?.id || 0,
                name: user?.name || 'System'
              }
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update ticket status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      // In a real app, you would send this to your API
      // For now, we'll just simulate assigning locally
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      if (ticket && user) {
        setTicket({
          ...ticket,
          assignee: {
            id: user.id,
            name: user.name
          },
          comments: [
            ...ticket.comments,
            {
              id: Date.now(),
              text: `Ticket assigned to ${user.name}`,
              createdAt: new Date().toISOString(),
              user: {
                id: user.id,
                name: 'System'
              }
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert('Failed to assign ticket. Please try again.');
    }
  };

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading ticket details...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 p-4 rounded-md mb-4">
        <div className="text-red-700">{error || 'Ticket not found'}</div>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 btn-secondary"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Tickets
        </button>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              disabled={updatingStatus}
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="form-input py-1 pr-8"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          {!ticket.assignee && (
            <button
              onClick={handleAssignToMe}
              className="btn-secondary"
            >
              Assign to Me
            </button>
          )}
          
          <button
            onClick={() => navigate(`/tickets/${id}/edit`)}
            className="btn-primary"
          >
            <PencilIcon className="-ml-1 mr-1 h-5 w-5" />
            Edit
          </button>
        </div>
      </div>
      
      {/* Ticket header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                #{ticket.id} - {ticket.title}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
                <span className="text-gray-500">
                  Created on {formatDate(ticket.created)}
                </span>
                <span className="text-gray-500">
                  Category: {ticket.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ticket details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="md:col-span-2">
          {/* Description */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700">
                {ticket.description}
              </div>
              
              {/* Attachments */}
              {ticket.attachments.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {ticket.attachments.map((attachment) => (
                      <li key={attachment.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <span className="ml-2 flex-1 w-0 truncate">{attachment.filename}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a href={attachment.url} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Download
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
              
              {/* Comment list */}
              <ul className="space-y-4">
                {ticket.comments.map((comment) => (
                  <li key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{comment.user.name}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          <p>{comment.text}</p>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Add comment form */}
              <div className="mt-6">
                <form onSubmit={handleSubmitComment}>
                  <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                    <label htmlFor="comment" className="sr-only">Add a comment</label>
                    <textarea
                      rows={3}
                      name="comment"
                      id="comment"
                      className="block w-full py-3 border-0 resize-none focus:ring-0 sm:text-sm"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                    />
                    
                    <div className="py-2 px-3 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="btn-primary py-1"
                        >
                          {submittingComment ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Requester info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Requester</h2>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{ticket.requester.name}</p>
                  <p className="text-sm text-gray-500">{ticket.requester.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Assignee info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Assignee</h2>
              {ticket.assignee ? (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{ticket.assignee.name}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  <p>No one is assigned to this ticket yet.</p>
                  <button
                    onClick={handleAssignToMe}
                    className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-900"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-1" />
                    Assign to me
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('In Progress')}
                  className="w-full btn-secondary justify-center"
                  disabled={ticket.status === 'In Progress'}
                >
                  <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                  Mark as In Progress
                </button>
                
                <button
                  onClick={() => handleStatusChange('Resolved')}
                  className="w-full btn-secondary justify-center"
                  disabled={ticket.status === 'Resolved'}
                >
                  <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
