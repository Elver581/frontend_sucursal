import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(id);
      setPost(response.data);
    } catch (error) {
      setError('Post no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post no encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-gray-500">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Por {post.author || post.user?.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Publicado el {formatDate(post.created_at)}</span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>

        <footer className="bg-gray-50 px-8 py-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {post.updated_at !== post.created_at && (
                <span>Actualizado el {formatDate(post.updated_at)}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver más posts
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default PostDetail;
