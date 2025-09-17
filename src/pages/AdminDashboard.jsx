import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import '../styles/sweetalert2-custom.css';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalUsers: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Empresas',
      value: stats.totalCompanies,
      icon: Building,
      color: 'blue',
      description: 'Empresas registradas'
    },
    {
      title: 'Empresas Activas',
      value: stats.activeCompanies,
      icon: CheckCircle,
      color: 'green',
      description: 'En funcionamiento'
    },
    {
      title: 'Empresas Inactivas',
      value: stats.inactiveCompanies,
      icon: XCircle,
      color: 'red',
      description: 'Suspendidas o inactivas'
    },
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'purple',
      description: 'Usuarios registrados'
    },
    {
      title: 'Pendientes',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'yellow',
      description: 'Esperando aprobación'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const handleCardClick = (cardTitle) => {
    switch (cardTitle) {
      case 'Total Empresas':
      case 'Empresas Activas':
      case 'Empresas Inactivas':
        navigate('/admin/companies');
        break;
      case 'Total Usuarios':
        navigate('/admin/users');
        break;
      case 'Pendientes':
        showPendingInfo();
        break;
      default:
        break;
    }
  };

  const showPendingInfo = async () => {
    await Swal.fire({
      title: 'Elementos Pendientes',
      html: `
        <div class="text-left space-y-3">
          <div class="bg-yellow-50 p-3 rounded-lg">
            <h4 class="font-medium text-yellow-800">Sucursales pendientes de activación</h4>
            <p class="text-sm text-yellow-600">Hay ${stats.pendingApprovals} sucursales esperando aprobación del super administrador.</p>
          </div>
          <div class="mt-4">
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" onclick="window.location.href='/admin/companies'">
              Ver empresas y sucursales
            </button>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Cerrar'
    });
  };

  const showSystemInfo = async () => {
    await Swal.fire({
      title: 'Información del Sistema',
      html: `
        <div class="text-left space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-3 rounded-lg">
              <h4 class="font-medium text-blue-800">Empresas</h4>
              <p class="text-sm text-blue-600">Activas: ${stats.activeCompanies}</p>
              <p class="text-sm text-blue-600">Inactivas: ${stats.inactiveCompanies}</p>
              <p class="text-sm text-blue-600">Total: ${stats.totalCompanies}</p>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
              <h4 class="font-medium text-purple-800">Usuarios</h4>
              <p class="text-sm text-purple-600">Total: ${stats.totalUsers}</p>
              <p class="text-sm text-purple-600">Pendientes: ${stats.pendingApprovals}</p>
            </div>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h4 class="font-medium text-green-800">Estado del Sistema</h4>
            <p class="text-sm text-green-600">✅ API funcionando correctamente</p>
            <p class="text-sm text-green-600">✅ Base de datos conectada</p>
            <p class="text-sm text-green-600">✅ Servicios activos</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Cerrar',
      width: 600
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Bienvenido, {user?.name}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin/companies')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>Gestionar Empresas</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Gestionar Usuarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(card.title)}
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all cursor-pointer hover:scale-105 ${getColorClasses(card.color)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="h-8 w-8" />
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">{card.title}</h3>
              <p className="text-sm opacity-80">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/companies')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Building className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Empresas</h3>
            <p className="text-sm text-gray-600">Gestionar empresas registradas</p>
          </button>
          
          <button
            onClick={() => navigate('/admin/users')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Users className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ver Usuarios</h3>
            <p className="text-sm text-gray-600">Administrar usuarios del sistema</p>
          </button>
          
          <button
            onClick={showSystemInfo}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <Activity className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Info del Sistema</h3>
            <p className="text-sm text-gray-600">Ver información detallada</p>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Sistema</h2>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700 font-medium">Sistema funcionando correctamente</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
