import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  EyeIcon, 
  StarIcon, 
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface ArticleStats {
  id: number;
  title: string;
  slug: string;
  viewCount: number;
  ratingCount: number;
  averageRating: number;
  category: {
    name: string;
  };
  author: {
    name: string;
  };
  publishedAt: string;
}

interface AnalyticsData {
  totalArticles: number;
  totalViews: number;
  totalRatings: number;
  averageRating: number;
  topViewedArticles: ArticleStats[];
  topRatedArticles: ArticleStats[];
  recentArticles: ArticleStats[];
  categoryStats: Array<{
    name: string;
    articleCount: number;
    viewCount: number;
    averageRating: number;
  }>;
}

const KnowledgeBaseAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!user || user.role === 'customer') {
      navigate('/knowledge-base');
      return;
    }
    
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an actual API endpoint
      // For now, we'll simulate the data
      const mockAnalytics: AnalyticsData = {
        totalArticles: 45,
        totalViews: 12450,
        totalRatings: 892,
        averageRating: 4.2,
        topViewedArticles: [
          {
            id: 1,
            title: "How to reset your password",
            slug: "reset-password",
            viewCount: 1250,
            ratingCount: 48,
            averageRating: 4.5,
            category: { name: "Authentication" },
            author: { name: "John Doe" },
            publishedAt: "2024-01-15T10:00:00Z"
          },
          {
            id: 2,
            title: "Getting started with the API",
            slug: "api-getting-started",
            viewCount: 980,
            ratingCount: 35,
            averageRating: 4.7,
            category: { name: "Technical" },
            author: { name: "Jane Smith" },
            publishedAt: "2024-01-10T14:30:00Z"
          },
          {
            id: 3,
            title: "Billing and subscription management",
            slug: "billing-subscription",
            viewCount: 750,
            ratingCount: 28,
            averageRating: 4.1,
            category: { name: "Billing" },
            author: { name: "Mike Johnson" },
            publishedAt: "2024-01-08T09:15:00Z"
          }
        ],
        topRatedArticles: [
          {
            id: 2,
            title: "Getting started with the API",
            slug: "api-getting-started",
            viewCount: 980,
            ratingCount: 35,
            averageRating: 4.7,
            category: { name: "Technical" },
            author: { name: "Jane Smith" },
            publishedAt: "2024-01-10T14:30:00Z"
          },
          {
            id: 4,
            title: "Advanced security features",
            slug: "security-features",
            viewCount: 420,
            ratingCount: 22,
            averageRating: 4.6,
            category: { name: "Security" },
            author: { name: "Sarah Wilson" },
            publishedAt: "2024-01-12T11:45:00Z"
          },
          {
            id: 1,
            title: "How to reset your password",
            slug: "reset-password",
            viewCount: 1250,
            ratingCount: 48,
            averageRating: 4.5,
            category: { name: "Authentication" },
            author: { name: "John Doe" },
            publishedAt: "2024-01-15T10:00:00Z"
          }
        ],
        recentArticles: [
          {
            id: 5,
            title: "New dashboard features",
            slug: "new-dashboard-features",
            viewCount: 125,
            ratingCount: 8,
            averageRating: 4.3,
            category: { name: "Features" },
            author: { name: "Alex Chen" },
            publishedAt: "2024-01-20T16:20:00Z"
          },
          {
            id: 6,
            title: "Mobile app troubleshooting",
            slug: "mobile-troubleshooting",
            viewCount: 89,
            ratingCount: 5,
            averageRating: 4.0,
            category: { name: "Technical" },
            author: { name: "Lisa Brown" },
            publishedAt: "2024-01-18T13:10:00Z"
          }
        ],
        categoryStats: [
          {
            name: "Authentication",
            articleCount: 8,
            viewCount: 2450,
            averageRating: 4.3
          },
          {
            name: "Technical",
            articleCount: 12,
            viewCount: 1980,
            averageRating: 4.1
          },
          {
            name: "Billing",
            articleCount: 6,
            viewCount: 1240,
            averageRating: 4.0
          },
          {
            name: "Security",
            articleCount: 4,
            viewCount: 890,
            averageRating: 4.5
          }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error || 'Failed to load analytics'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Analytics</h1>
            <p className="text-gray-600 mt-2">Track article performance and user engagement</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Articles</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalArticles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <EyeIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Ratings</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalRatings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Viewed Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Most Viewed Articles</h2>
            <div className="space-y-4">
              {analytics.topViewedArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <p className="text-sm text-gray-500">{article.category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {article.viewCount}
                    </div>
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(article.averageRating)}
                      </div>
                      ({article.ratingCount})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Rated Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Highest Rated Articles</h2>
            <div className="space-y-4">
              {analytics.topRatedArticles.map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <p className="text-sm text-gray-500">{article.category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(article.averageRating)}
                      </div>
                      <span className="ml-1 font-medium">{article.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {article.viewCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Performance */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.categoryStats.map((category, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.articleCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.viewCount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {renderStars(category.averageRating)}
                          </div>
                          <span className="text-sm text-gray-900">{category.averageRating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Articles</h2>
            <div className="space-y-4">
              {analytics.recentArticles.map((article) => (
                <div key={article.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    By {article.author.name} in {article.category.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{formatDate(article.publishedAt)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {article.viewCount}
                    </div>
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(article.averageRating)}
                      </div>
                      <span className="text-gray-500">({article.ratingCount})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseAnalytics;