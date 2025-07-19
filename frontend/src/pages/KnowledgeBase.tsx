import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  TagIcon, 
  FolderIcon,
  StarIcon,
  EyeIcon,
  ChevronRightIcon,
  PlusIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { useAuth } from '../context/AuthContext';

interface Article {
  id: number;
  title: string;
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

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  subcategories: Category[];
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  articleCount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const KnowledgeBase: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'));
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const page = searchParams.get('page') || '1';
      params.append('page', page);
      
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedTag) params.append('tagId', selectedTag);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to load articles');
      
      const data = await response.json();
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories/tree');
      if (!response.ok) throw new Error('Failed to load categories');
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags/popular?limit=20');
      if (!response.ok) throw new Error('Failed to load tags');
      
      const data = await response.json();
      setTags(data.tags);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  useEffect(() => {
    loadArticles();
    loadCategories();
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTag, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedTag) params.append('tag', selectedTag);
    setSearchParams(params);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams();
    if (categoryId) params.append('category', categoryId);
    if (selectedTag) params.append('tag', selectedTag);
    if (searchQuery) params.append('search', searchQuery);
    setSearchParams(params);
  };

  const handleTagFilter = (tagId: string | null) => {
    setSelectedTag(tagId);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (tagId) params.append('tag', tagId);
    if (searchQuery) params.append('search', searchQuery);
    setSearchParams(params);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <button
          onClick={() => handleCategoryFilter(category.id.toString())}
          className={`flex items-center justify-between w-full p-2 text-left rounded-lg hover:bg-gray-50 ${
            selectedCategory === category.id.toString() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <FolderIcon className="h-4 w-4 mr-2" />
            {category.name}
          </div>
          <span className="text-sm text-gray-500">({category.articleCount})</span>
        </button>
        {category.subcategories.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600">Find answers to common questions and get help with your issues.</p>
          </div>
          
          {/* Action Buttons for Agents/Admins */}
          {user && (user.role === 'agent' || user.role === 'admin') && (
            <div className="flex space-x-4">
              <Link
                to="/knowledge-base/new"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Article
              </Link>
              
              {user.role === 'admin' && (
                <>
                  <Link
                    to="/knowledge-base/categories"
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Manage Categories
                  </Link>
                  
                  <Link
                    to="/knowledge-base/analytics"
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Analytics
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`flex items-center justify-between w-full p-2 text-left rounded-lg hover:bg-gray-50 ${
                  !selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  All Categories
                </div>
              </button>
              {renderCategoryTree(categories)}
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h2>
            <div className="space-y-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagFilter(tag.id.toString())}
                  className={`flex items-center justify-between w-full p-2 text-left rounded-lg hover:bg-gray-50 ${
                    selectedTag === tag.id.toString() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-2" />
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    ></span>
                    {tag.name}
                  </div>
                  <span className="text-sm text-gray-500">({tag.articleCount})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filters */}
          {(selectedCategory || selectedTag || searchQuery) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                    <button
                      onClick={() => handleCategoryFilter(null)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Tag: {tags.find(t => t.id.toString() === selectedTag)?.name}
                    <button
                      onClick={() => handleTagFilter(null)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Search: {searchQuery}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchParams(new URLSearchParams());
                      }}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Articles'}
              <span className="text-sm text-gray-500 ml-2">
                ({pagination.totalItems} {pagination.totalItems === 1 ? 'article' : 'articles'})
              </span>
            </h2>
          </div>

          {/* Articles */}
          <div className="space-y-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link 
                        to={`/knowledge-base/${article.slug}`}
                        className="hover:text-blue-600"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-3">{article.excerpt}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FolderIcon className="h-4 w-4 mr-1" />
                        <Link 
                          to={`/knowledge-base?category=${article.category.id}`}
                          className="hover:text-blue-600"
                        >
                          {article.category.name}
                        </Link>
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {article.viewCount} views
                      </div>
                      <div className="flex items-center">
                        <div className="flex mr-1">
                          {renderStars(article.averageRating)}
                        </div>
                        {article.ratingCount > 0 && (
                          <span>({article.ratingCount})</span>
                        )}
                      </div>
                    </div>

                    {article.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagFilter(tag.id.toString())}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs hover:bg-gray-100"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {
                  Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
                } of {pagination.totalItems} articles
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', (i + 1).toString());
                      setSearchParams(params);
                    }}
                    className={`px-3 py-2 rounded ${
                      pagination.currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;