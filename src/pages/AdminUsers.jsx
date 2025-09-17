import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  Building,
  User,
  UserCog,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/sweetalert2-custom.css';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [currentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        company: companyFilter || undefined
      };
      
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter, companyFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'company_admin':
        return <UserCog className="h-4 w-4 text-blue-600" />;
      case 'manager':
        return <Building className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleName = (role) => {
    const roles = {
      'super_admin': 'Super Admin',
      'company_admin': 'Admin Empresa',
      'manager': 'Gerente',
      'employee': 'Empleado'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'company_admin': 'bg-blue-100 text-blue-800',
      'manager': 'bg-purple-100 text-purple-800',
      'employee': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.employee;
  };

  const handleViewUser = async (userId, userName) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      const userData = response.data;
      
      Swal.fire({
        title: `Detalles de ${userName}`,
        html: `
          <div class="text-left space-y-3">
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Rol:</strong> ${getRoleName(userData.role)}</p>
            <p><strong>Empresa:</strong> ${userData.company ? userData.company.name : 'Sin empresa'}</p>
            <p><strong>Sucursal:</strong> ${userData.branch ? userData.branch.name : 'Sin sucursal'}</p>
            <p><strong>Estado:</strong> ${userData.email_verified_at ? 'Verificado' : 'Pendiente'}</p>
            <p><strong>Registrado:</strong> ${new Date(userData.created_at).toLocaleDateString()}</p>
            <p><strong>Última actualización:</strong> ${new Date(userData.updated_at).toLocaleDateString()}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Cerrar'
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los detalles del usuario.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (userRole === 'super_admin') {
      Swal.fire({
        title: 'Acción no permitida',
        text: 'No se puede eliminar a un Super Administrador.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `¿Está seguro de que desea eliminar al usuario "<strong>${userName}</strong>"?<br><br><small class="text-red-500">Esta acción no se puede deshacer.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/users/${userId}`);
        await fetchUsers();
        
        Swal.fire({
          title: '¡Eliminado!',
          text: `El usuario "${userName}" ha sido eliminado.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el usuario. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleEditUser = async (userId, userName, userEmail, userRole) => {
    if (userRole === 'super_admin') {
      Swal.fire({
        title: 'Acción no permitida',
        text: 'No se puede editar a un Super Administrador.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: `Editar Usuario: ${userName}`,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input id="swal-input1" class="swal2-input" placeholder="Ej: Juan Pérez" value="${userName}" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input id="swal-input2" class="swal2-input" placeholder="Ej: juan@empresa.com" value="${userEmail}" type="email" style="margin: 0; width: 100%;">
            <small class="text-gray-500">Este será su nombre de usuario para iniciar sesión</small>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol del usuario</label>
            <select id="swal-input3" class="swal2-select" style="margin: 0; width: 100%;">
              <option value="company_admin" ${userRole === 'company_admin' ? 'selected' : ''}>🏢 Admin Empresa - Acceso completo a la empresa</option>
              <option value="manager" ${userRole === 'manager' ? 'selected' : ''}>👨‍💼 Gerente - Gestión de sucursal y empleados</option>
              <option value="employee" ${userRole === 'employee' ? 'selected' : ''}>👤 Empleado - Operaciones básicas</option>
            </select>
            <small class="text-gray-500">Selecciona el nivel de acceso apropiado</small>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '💾 Actualizar Usuario',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      width: 500,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const email = document.getElementById('swal-input2').value.trim();
        const role = document.getElementById('swal-input3').value;
        
        if (!name || name.length < 2) {
          Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
          return false;
        }
        
        if (!email) {
          Swal.showValidationMessage('El email es obligatorio');
          return false;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Por favor ingresa un email válido');
          return false;
        }
        
        if (!role) {
          Swal.showValidationMessage('Debes seleccionar un rol');
          return false;
        }
        
        return { name, email, role };
      }
    });

    if (formValues) {
      try {
        await api.put(`/admin/users/${userId}`, formValues);
        await fetchUsers();
        
        Swal.fire({
          title: '¡Actualizado!',
          text: `El usuario "${formValues.name}" ha sido actualizado exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating user:', error);
        const errorMessage = error.response?.data?.message || 'No se pudo actualizar el usuario. Inténtelo nuevamente.';
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="h-7 w-7 text-purple-600" />
              <span>Gestión de Usuarios</span>
            </h1>
            <p className="text-gray-600 mt-2">Administrar todos los usuarios del sistema</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="company_admin">Admin Empresa</option>
            <option value="manager">Gerente</option>
            <option value="employee">Empleado</option>
          </select>
          
          <input
            type="text"
            placeholder="Filtrar por empresa..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Empresa</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Registrado</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {user.company ? (
                        <div>
                          <p className="text-gray-900 font-medium">{user.company.name}</p>
                          <p className="text-gray-500">{user.company.rut}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin empresa</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.email_verified_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.email_verified_at ? 'Verificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(user.id, user.name)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user.id, user.name, user.email, user.role)}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.role !== 'super_admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
