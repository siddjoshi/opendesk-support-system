import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PaperClipIcon, BookOpenIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';

interface SuggestedArticle {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  category: {
    name: string;
  };
  averageRating: number;
  viewCount: number;
}

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General',
  });
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestedArticles, setSuggestedArticles] = useState<SuggestedArticle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingArticles, setSearchingArticles] = useState(false);

  // Debounced search for articles
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (formData.title.trim().length > 3 || formData.description.trim().length > 10) {
        searchArticles();
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.description]);

  const searchArticles = async () => {
    try {
      setSearchingArticles(true);
      const query = `${formData.title} ${formData.description}`.trim();
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedArticles(data.articles);
        setShowSuggestions(data.articles.length > 0);
      }
    } catch (err) {
      console.error('Error searching articles:', err);
    } finally {
      setSearchingArticles(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real app, you would send this data to your API
      // For now, we'll just simulate a successful submission
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to tickets page on success
      navigate('/tickets');
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Tickets
        </button>
        
        <h1 className="text-2xl font-semibold text-gray-900">Create New Ticket</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form container */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {error && (
              <div className="bg-red-50 p-4 border-l-4 border-red-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Brief summary of the issue"
                />
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Please provide detailed information about the issue..."
                />
              </div>
              
              {/* Priority and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="General">General</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>
              
              {/* File attachments */}
              <div className="mb-6">
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB each</p>
                  </div>
                </div>
                
                {files && files.length > 0 && (
                  <ul className="mt-3 border border-gray-200 rounded-md divide-y divide-gray-200">
                    {Array.from(files).map((file, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <PaperClipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="font-medium text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {/* Form actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Suggested Articles Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Suggested Articles</h2>
            </div>
            
            {searchingArticles ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : showSuggestions && suggestedArticles.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Before creating a ticket, check if these articles can help resolve your issue:
                </p>
                
                {suggestedArticles.map((article) => (
                  <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <h3 className="font-medium text-gray-900 mb-2">
                      <Link 
                        to={`/knowledge-base/${article.slug}`}
                        className="hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {article.category.name}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <div className="flex mr-1">
                            {renderStars(article.averageRating)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          {article.viewCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4 border-t border-gray-200">
                  <Link 
                    to="/knowledge-base"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Browse all articles →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  {formData.title || formData.description 
                    ? 'No relevant articles found for your query.'
                    : 'Start typing your issue to see relevant articles.'
                  }
                </p>
                <Link 
                  to="/knowledge-base"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
                >
                  Browse knowledge base →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
