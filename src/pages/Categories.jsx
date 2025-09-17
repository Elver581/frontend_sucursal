import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Tag, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Package,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [message, setMessage] = useState(location.state?.message || '');
  const [messageType, setMessageType] = useState(location.state?.type || '');

  useEffect(() => {
    fetchCategories();
    
    // Limpiar el mensaje después de mostrarlo
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll({
        with_products_count: true
      });
      
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const response = await categoriesAPI.toggleStatus(category.id);
      
      if (response.data.success) {
        await fetchCategories();
        setMessage(response.data.message);
        setMessageType('success');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al cambiar el estado');
      setMessageType('error');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      return;
    }

    try {
      const response = await categoriesAPI.delete(category.id);
      
      if (response.data.success) {
        await fetchCategories();
        setMessage('Categoría eliminada exitosamente');
        setMessageType('success');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al eliminar la categoría');
      setMessageType('error');
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && category.is_active) ||
                         (filterActive === 'inactive' && !category.is_active);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600 mt-2">
            Organiza y administra las categorías de tus productos
          </p>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message}
          </div>
        )}

        {/* Controles */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                {/* Filtro de estado */}
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>

                {/* Botón crear */}
                <button
                  onClick={() => navigate('/categories/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Categoría
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="bg-white rounded-xl shadow-sm border">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterActive !== 'all' ? 'No se encontraron categorías' : 'No hay categorías'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterActive !== 'all' 
                  ? 'Prueba con otros términos de búsqueda o filtros'
                  : 'Crea tu primera categoría para organizar tus productos'
                }
              </p>
              {!searchTerm && filterActive === 'all' && (
                <button
                  onClick={() => navigate('/categories/create')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primera Categoría
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Tag className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        
                        {/* Estado */}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {category.is_active ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Activa
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Inactiva
                            </>
                          )}
                        </span>

                        {/* Contador de productos */}
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {category.products_count || 0} productos
                        </span>
                      </div>

                      {category.description && (
                        <p className="text-gray-600 ml-8">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/categories/${category.id}/edit`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar categoría"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(category)}
                        className={`p-2 rounded-lg transition-colors ${
                          category.is_active
                            ? 'text-gray-600 hover:bg-gray-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={category.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {category.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
