import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FolderIcon, 
  TagIcon, 
  EyeIcon, 
  StarIcon, 
  UserIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: number;
    name: string;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    color: string;
  }>;
  viewCount: number;
  averageRating: number;
  ratingCount: number;
  publishedAt: string;
  updatedAt: string;
}

interface UserRating {
  id: number;
  rating: number;
  feedback: string;
  isHelpful: boolean;
}

interface RelatedArticle {
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

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isHelpful, setIsHelpful] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadRelatedArticles = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedArticles(data.relatedArticles);
      }
    } catch (err) {
      console.error('Error loading related articles:', err);
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) throw new Error('Article not found');
      
      const data = await response.json();
      setArticle(data.article);
      setUserRating(data.userRating);
      
      // Load related articles
      if (data.article.id) {
        loadRelatedArticles(data.article.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article) return;

    try {
      setSubmittingRating(true);
      const response = await fetch(`/api/articles/${article.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          rating,
          feedback,
          isHelpful,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      // Refresh article to get updated ratings
      await loadArticle();
      setShowRatingForm(false);
      setRating(0);
      setFeedback('');
      setIsHelpful(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      const StarComponent = filled ? StarIconSolid : StarIcon;
      
      if (interactive && onStarClick) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => onStarClick(i)}
            className="text-yellow-400 hover:text-yellow-500 focus:outline-none"
          >
            <StarComponent className="h-6 w-6" />
          </button>
        );
      } else {
        stars.push(
          <StarComponent 
            key={i} 
            className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
          />
        );
      }
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error || 'Article not found'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/knowledge-base" className="hover:text-blue-600">
          Knowledge Base
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link 
          to={`/knowledge-base?category=${article.category.id}`}
          className="hover:text-blue-600"
        >
          {article.category.name}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-gray-900">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <article className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{article.author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    <span>{article.viewCount} views</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(article.averageRating)}
                    </div>
                    {article.ratingCount > 0 && (
                      <span className="text-sm text-gray-500">({article.ratingCount} ratings)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <Link 
                    to={`/knowledge-base?category=${article.category.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {article.category.name}
                  </Link>
                </div>
                
                {article.tags.length > 0 && (
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-1 text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          to={`/knowledge-base?tag=${tag.id}`}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs hover:bg-gray-100"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div 
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Rating Section */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this article helpful?</h3>
              
              {user ? (
                <div>
                  {userRating ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">You rated this article:</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(userRating.rating)}
                        </div>
                        <button
                          onClick={() => setShowRatingForm(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Update rating
                        </button>
                      </div>
                      {userRating.feedback && (
                        <p className="text-sm text-gray-600 mt-2">Your feedback: {userRating.feedback}</p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowRatingForm(true)}
                          className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <HandThumbUpIcon className="h-4 w-4 mr-2" />
                          Yes, this was helpful
                        </button>
                        <button
                          onClick={() => {
                            setIsHelpful(false);
                            setShowRatingForm(true);
                          }}
                          className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <HandThumbDownIcon className="h-4 w-4 mr-2" />
                          No, this needs improvement
                        </button>
                      </div>
                    </div>
                  )}

                  {showRatingForm && (
                    <form onSubmit={handleRatingSubmit} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Rate this article</h4>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating (1-5 stars)
                        </label>
                        <div className="flex">
                          {renderStars(rating, true, setRating)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback (optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us how we can improve this article..."
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="helpful"
                            checked={isHelpful}
                            onChange={(e) => setIsHelpful(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="helpful" className="ml-2 text-sm text-gray-700">
                            This article was helpful
                          </label>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowRatingForm(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingRating || rating === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {submittingRating ? 'Submitting...' : 'Submit Rating'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please log in to rate this article</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-2">
                      <Link 
                        to={`/knowledge-base/${relatedArticle.slug}`}
                        className="hover:text-blue-600"
                      >
                        {relatedArticle.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{relatedArticle.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{relatedArticle.category.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(relatedArticle.averageRating)}
                        </div>
                        <span>({relatedArticle.viewCount} views)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;