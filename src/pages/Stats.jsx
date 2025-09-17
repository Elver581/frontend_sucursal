import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { BarChart3, TrendingUp, Calendar, DollarSign, Package, Eye, Users } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState({
    dailySales: [],
    monthlySales: [],
    totalRevenue: 0,
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    avgDailyRevenue: 0,
    topCategories: [],
    recentSales: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 3months

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [productsResponse, soldResponse] = await Promise.all([
        productsAPI.getMyProducts(1),
        productsAPI.getMyProducts(1, { sold: true })
      ]);

      const allProducts = productsResponse.data.data;
      const soldProducts = soldResponse.data.data.filter(p => p.is_sold);

      // Generate daily sales data (simulated for demo)
      const dailySalesData = generateDailySalesData(soldProducts, timeRange);
      const totalRevenue = soldProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
      
      // Category analysis
      const categoryStats = {};
      soldProducts.forEach(product => {
        categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
      });
      
      const topCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      setStats({
        dailySales: dailySalesData,
        totalRevenue,
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter(p => !p.is_sold).length,
        soldProducts: soldProducts.length,
        avgDailyRevenue: dailySalesData.length > 0 ? totalRevenue / dailySalesData.length : 0,
        topCategories,
        recentSales: soldProducts.slice(0, 5)
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailySalesData = (soldProducts, range) => {
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Simulate some sales data based on actual products
      const salesCount = Math.floor(Math.random() * (soldProducts.length / 3)) + 
                        (i < 7 ? 1 : 0); // More recent sales
      const revenue = salesCount * (soldProducts.length > 0 ? 
        soldProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) / soldProducts.length / 7 : 0);
      
      data.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        }),
        sales: salesCount,
        revenue: Math.round(revenue)
      });
    }

    return data;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.dailySales.map(d => d.revenue));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas de Ventas</h1>
            <p className="text-gray-600 mt-1">Análisis detallado de tu rendimiento</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { value: '7days', label: '7 días' },
            { value: '30days', label: '30 días' },
            { value: '3months', label: '3 meses' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 mr-3" />
            <div>
              <p className="text-blue-100">Ingresos Totales</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="h-8 w-8 mr-3" />
            <div>
              <p className="text-green-100">Productos Vendidos</p>
              <p className="text-2xl font-bold">{stats.soldProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            <div>
              <p className="text-purple-100">Promedio Diario</p>
              <p className="text-2xl font-bold">{formatPrice(stats.avgDailyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Eye className="h-8 w-8 mr-3" />
            <div>
              <p className="text-orange-100">Productos Activos</p>
              <p className="text-2xl font-bold">{stats.activeProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ingresos Diarios</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Últimos {timeRange === '7days' ? '7 días' : timeRange === '30days' ? '30 días' : '3 meses'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats.dailySales.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{day.displayDate}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                  >
                    {day.revenue > 0 && (
                      <span className="text-white text-xs font-medium">
                        {formatPrice(day.revenue)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600">{day.sales}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Categorías Más Vendidas</h3>
          
          {stats.topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 mb-2" />
              <p>No hay datos de categorías aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">{category.category}</span>
                      <span className="text-sm text-gray-500">{category.count} ventas</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(category.count / Math.max(...stats.topCategories.map(c => c.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
          </div>
        </div>
        
        {stats.recentSales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-2" />
            <p>No hay ventas recientes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{sale.name}</p>
                    <p className="text-sm text-gray-500">
                      Vendido el {formatDate(sale.updated_at)} • {sale.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{formatPrice(sale.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
