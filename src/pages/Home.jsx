import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { salesAPI, statsAPI } from '../services/api';
import Landing from './Landing';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye
} from 'lucide-react';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    today_sales: 0,
    month_sales: 0,
    total_products: 0,
    low_stock_alerts: 0,
    recent_sales: [],
    top_products: []
  });
  const [salesSummary, setSalesSummary] = useState({ summary: [], total_sales: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardStats();
      fetchSalesSummary();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Si no hay usuario autenticado, mostrar la landing page empresarial
  if (!authLoading && !user) {
    return <Landing />;
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await statsAPI.getDashboard();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesSummary = async () => {
    try {
      const response = await salesAPI.salesByPaymentMethod('today');
      if (response.data.success) {

        console.log('Resumen de ventas:', response.data.data);
        setSalesSummary(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener resumen de ventas:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Cargando Dashboard Empresarial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section Empresarial */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Sistema de Gestión Empresarial
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
            Centro de Control Empresarial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Gestiona tu inventario, ventas, compras y obtén insights valiosos para hacer crecer tu negocio con nuestra plataforma integral.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-semibold">Ver Dashboard</span>
            </Link>
            <Link
              to="/create-product"
              className="bg-white text-gray-800 px-8 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Agregar Producto</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Ventas Hoy</h3>
                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.today_sales || 0)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+15.3% vs ayer</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Ventas del Mes</h3>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(stats.month_sales || 0)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">+8.2% vs mes anterior</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Productos</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.total_products || 0}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600 font-medium">En inventario</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Alertas Stock</h3>
                <p className="text-2xl font-bold text-red-600">{stats.low_stock_alerts || 0}</p>
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 font-medium">Requieren atención</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Ventas de hoy por método de pago */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ventas de Hoy por Método de Pago</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Método de Pago</th>
                <th className="text-right py-2">Cantidad de Ventas</th>
                <th className="text-right py-2">Total</th>
                <th className="text-right py-2">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {salesSummary.summary.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-2">{row.method}</td>
                  <td className="py-2 text-right">{row.total_sales}</td>
                  <td className="py-2 text-right">{formatPrice(row.total_amount)}</td>
                  <td className="py-2 text-right">{formatPrice(row.average_sale)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t">
                <td className="py-2">Total</td>
                <td className="py-2 text-right">{salesSummary.total_sales}</td>
                <td className="py-2 text-right">{formatPrice(salesSummary.total_amount)}</td>
                <td className="py-2 text-right"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Inventario</h3>
              <p className="text-gray-600 mb-6">Administra tus productos, controla stock y optimiza tu inventario</p>
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Productos</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Control de Ventas</h3>
              <p className="text-gray-600 mb-6">Registra ventas, gestiona clientes y analiza tu rendimiento</p>
              <Link
                to="/sales"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Ver Ventas</span>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Reportes y Analytics</h3>
              <p className="text-gray-600 mb-6">Obtén insights valiosos y reportes detallados de tu negocio</p>
              <Link
                to="/dashboard"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Ver Reportes</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recent_sales && stats.recent_sales.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-b">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recent_sales.slice(0, 5).map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-4">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Nueva venta registrada</p>
                        <p className="text-sm text-gray-600">Cliente: {sale.customer_name || 'Venta directa'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatPrice(sale.total)}</p>
                      <p className="text-sm text-gray-500">{new Date(sale.created_at).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/create-product"
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Producto</span>
            </Link>
            <Link
              to="/sales/create"
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Nueva Venta</span>
            </Link>
            <Link
              to="/purchases/create"
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Package className="h-5 w-5" />
              <span>Nueva Compra</span>
            </Link>
            <Link
              to="/dashboard"
              className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Ver Reportes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
