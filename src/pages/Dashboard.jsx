import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, statsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Package, 
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  ShoppingCart,
  Users,
  Truck
} from 'lucide-react';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dashboardStats, setDashboardStats] = useState({
    today_sales: 0,
    month_sales: 0,
    total_products: 0,
    low_stock_alerts: 0
  });
  const { user } = useAuth();
  const { showToast } = useToast();

  // Definir las funciones con useCallback primero
  const fetchDashboardData = useCallback(async () => {
    try {
      // Obtener estadísticas básicas
      const statsResponse = await statsAPI.getDashboard();
      setDashboardStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      showToast('Error al cargar estadísticas del dashboard', 'error');
    }
  }, [showToast]);

  const fetchMyProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') {
        params.published = statusFilter === 'published' ? 1 : 0;
      }

      const response = await productsAPI.getAll(params);
      console.log('Respuesta de productos:', response);
      setProducts(response.data.data || []);
      setPagination(response.data.meta || null);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, showToast]);

  // Ahora los useEffect que usan las funciones
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
useEffect(() => {
  setCurrentPage(1); // Reinicia la página al cambiar filtro/búsqueda
}, [searchTerm, statusFilter]);

useEffect(() => {
  fetchMyProducts(currentPage);
}, [currentPage, searchTerm, statusFilter, fetchMyProducts]);

  const handleTogglePublished = async (productId, currentStatus) => {
    try {
      await productsAPI.togglePublished(productId, !currentStatus);
      await fetchMyProducts(currentPage);
      showToast(
        `Producto ${!currentStatus ? 'publicado' : 'ocultado'} exitosamente`,
        'success'
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToast('Error al actualizar el estado del producto', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará el producto de forma permanente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

    if (result.isConfirmed) {
    try {
      await productsAPI.delete(productId);
      Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
      // Actualiza la lista de productos
      fetchMyProducts(currentPage);
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
    }
  }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Cargando Centro de Inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Empresarial */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent flex items-center">
              <Package className="mr-4 text-blue-600" />
              Centro de Control de Inventario
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Bienvenido, <span className="font-semibold text-blue-600">{user?.name}</span> • 
              Administra tu catálogo empresarial
            </p>
          </div>
          <Link
            to="/create-product"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Agregar Producto</span>
          </Link>
        </div>

        {/* Enlaces Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/sales"
            className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ventas</h3>
                <p className="text-sm text-gray-600">Registrar ventas</p>
              </div>
            </div>
          </Link>

          <Link
            to="/purchases"
            className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg mr-4">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Compras</h3>
                <p className="text-sm text-gray-600">Gestionar compras</p>
              </div>
            </div>
          </Link>

          <Link
            to="/suppliers"
            className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg mr-4">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Proveedores</h3>
                <p className="text-sm text-gray-600">Gestionar proveedores</p>
              </div>
            </div>
          </Link>

          <Link
            to="/categories"
            className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-lg mr-4">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Categorías</h3>
                <p className="text-sm text-gray-600">Organizar productos</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Ventas Hoy</h3>
                <p className="text-2xl font-bold text-green-600">{formatPrice(dashboardStats.today_sales || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Ventas del Mes</h3>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(dashboardStats.month_sales || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg mr-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Productos</h3>
                <p className="text-2xl font-bold text-purple-600">{dashboardStats.total_products || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-3 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Alertas de Stock</h3>
                <p className="text-2xl font-bold text-red-600">{dashboardStats.low_stock_alerts || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                Catálogo de Productos ({pagination?.total || products.length})
              </h3>
              
              {/* Filtros y búsqueda */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset page when searching
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1); // Reset page when filtering
                    }}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">Todos</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Ocultos</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Precio</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-800">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-500">Descripción: {product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.cost_price && (
                          <p className="text-sm text-gray-500">
                            Costo: {formatPrice(product.cost_price)}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          product.stock === 0 
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : product.stock <= (product.min_stock || 5)
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                 <td className="py-4 px-6">
  {product.is_published ? (
    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-300">
      <Eye className="h-4 w-4 mr-1" />
      Publicado
    </span>
  ) : (
    <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold border border-gray-300">
      <EyeOff className="h-4 w-4 mr-1" />
      Oculto
    </span>
  )}
</td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(product.created_at).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                        <button
  onClick={() => handleTogglePublished(product.id, product.is_published)}
  className={`p-2 rounded-lg transition-colors ${
    product.is_published
      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      : 'bg-green-100 text-green-700 hover:bg-green-200'
  }`}
  title={product.is_published ? 'Ocultar producto' : 'Publicar producto'}
>
  {product.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</button>
                          <Link
                            to={`/edit-product/${product.id}`}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
          {pagination && pagination.last_page > 1 && (
  <div className="p-6 border-t bg-gray-50">
    <div className="flex items-center justify-between">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <span className="text-sm text-gray-700">
        Página {pagination.current_page} de {pagination.last_page}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
        disabled={currentPage === pagination.last_page}
        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  </div>
)}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No hay productos en tu inventario</h4>
              <p className="text-gray-500 mb-6">Comienza agregando tu primer producto al catálogo empresarial</p>
              <Link
                to="/create-product"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300"
              >
                Agregar Primer Producto
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
