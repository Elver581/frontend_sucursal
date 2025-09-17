import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI, inventoryAPI, statsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  ShoppingCart,
  BarChart3,
  Users,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Plus
} from 'lucide-react';

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    sales_stats: {
      today_sales: 0,
      month_sales: 0,
      total_sales: 0,
      total_revenue: 0
    },
    inventory_summary: {
      total_products: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      inventory_value: 0
    },
    recent_sales: [],
    alerts: {
      low_stock: [],
      out_of_stock: []
    }
  });
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas de ventas
      const salesStats = await salesAPI.getStats();
      
      // Obtener resumen de inventario
      const inventoryStats = await inventoryAPI.getSummary();
      
      // Obtener alertas de inventario
      const alerts = await inventoryAPI.getAlerts();
      
      // Obtener ventas recientes (últimas 5)
      const recentSales = await salesAPI.getAll({ limit: 5 });

      setDashboardData({
        sales_stats: salesStats.data,
        inventory_summary: inventoryStats.data,
        recent_sales: recentSales.data.data || [],
        alerts: alerts.data
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Si no está autenticado, mostrar página de bienvenida
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Sistema de Gestión Empresarial
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Controla tu inventario, gestiona tus ventas, administra tus compras y 
                obtén estadísticas detalladas de tu negocio en un solo lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Registrarse
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-blue-600 mb-4">
                    <Package className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Control de Inventario</h3>
                  <p className="text-gray-600">
                    Gestiona tu stock, recibe alertas de productos con bajo inventario y 
                    mantén un control preciso de tus productos.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-green-600 mb-4">
                    <TrendingUp className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Gestión de Ventas</h3>
                  <p className="text-gray-600">
                    Registra tus ventas, gestiona clientes, controla métodos de pago y 
                    obtén reportes detallados de tu rendimiento.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-purple-600 mb-4">
                    <BarChart3 className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Estadísticas Avanzadas</h3>
                  <p className="text-gray-600">
                    Analiza tu negocio con reportes de ventas diarias, mensuales, 
                    rendimiento por producto y mucho más.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu negocio y las métricas más importantes
          </p>
        </div>

        {/* Alertas de Inventario */}
        {dashboardData.alerts.low_stock.length > 0 || dashboardData.alerts.out_of_stock.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Alertas de Inventario</h3>
            </div>
            
            {dashboardData.alerts.out_of_stock.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-red-700 mb-2">
                  Productos Agotados ({dashboardData.alerts.out_of_stock.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {dashboardData.alerts.out_of_stock.slice(0, 6).map(product => (
                    <div key={product.id} className="bg-white rounded p-2 text-sm">
                      <span className="font-medium">{product.product_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {dashboardData.alerts.low_stock.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">
                  Stock Bajo ({dashboardData.alerts.low_stock.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {dashboardData.alerts.low_stock.slice(0, 6).map(product => (
                    <div key={product.id} className="bg-white rounded p-2 text-sm">
                      <span className="font-medium">{product.product_name}</span>
                      <span className="text-gray-600 ml-2">({product.stock}/{product.min_stock})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-3">
              <Link
                to="/inventory"
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Ver inventario completo →
              </Link>
            </div>
          </div>
        ) : null}

        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(dashboardData.sales_stats.today_sales)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(dashboardData.sales_stats.month_sales)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboardData.inventory_summary.total_products}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPrice(dashboardData.inventory_summary.inventory_value)}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/sales"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Nueva Venta</h3>
                <p className="text-gray-600">Registrar venta</p>
              </div>
            </div>
          </Link>

          <Link
            to="/create-product"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Nuevo Producto</h3>
                <p className="text-gray-600">Agregar al inventario</p>
              </div>
            </div>
          </Link>

          <Link
            to="/purchases"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Nueva Compra</h3>
                <p className="text-gray-600">Registrar compra</p>
              </div>
            </div>
          </Link>

          <Link
            to="/stats"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ver Reportes</h3>
                <p className="text-gray-600">Estadísticas</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Ventas Recientes</h2>
              <Link 
                to="/sales" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas →
              </Link>
            </div>
          </div>

          {dashboardData.recent_sales.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay ventas registradas
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza registrando tu primera venta
              </p>
              <Link
                to="/sales"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nueva Venta
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recent_sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.product?.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cantidad: {sale.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(sale.total_price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sale.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(sale.sold_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
