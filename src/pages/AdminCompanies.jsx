import React, { useState, useEffect, useCallback } from 'react';
import { Eye, ToggleLeft, ToggleRight, Search, Filter, Building2, Users, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import '../styles/sweetalert2-custom.css';
import api from '../services/api';

const AdminCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({});

  const fetchCompanies = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/admin/companies?${params.toString()}`);
      setCompanies(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchCompanies();
      fetchStats();
    }
  }, [user, fetchCompanies, fetchStats]);

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await api.get(`/admin/companies/${companyId}`);
      setSelectedCompany(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const handleActivateCompany = async (companyId, companyName) => {
    // Ofrecer dos opciones: activación directa o envío de token por correo
    const result = await Swal.fire({
      title: '¿Cómo desea activar la empresa?',
      text: `Seleccione el método para activar la empresa "${companyName}"`,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#10b981',
      denyButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '⚡ Activar Directamente',
      denyButtonText: '📧 Enviar Token por Correo',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      html: `
        <div class="text-left mt-4">
          <h4 class="font-semibold text-gray-800 mb-2">Opciones disponibles:</h4>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-start gap-2">
              <span class="text-green-600">⚡</span>
              <div>
                <strong>Activar Directamente:</strong> La empresa se activa inmediatamente.
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600">📧</span>
              <div>
                <strong>Enviar Token por Correo:</strong> Se envía un enlace de activación al administrador de la empresa.
              </div>
            </div>
          </div>
        </div>
      `
    });

    if (result.isConfirmed) {
      // Activación directa
      try {
        await api.patch(`/admin/companies/${companyId}/activate`);
        await fetchCompanies();
        await fetchStats();
        
        Swal.fire({
          title: '¡Activada!',
          text: `La empresa "${companyName}" ha sido activada exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error activating company:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo activar la empresa. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    } else if (result.isDenied) {
      // Envío de token por correo
      try {
        const response = await api.post(`/admin/companies/${companyId}/send-activation-token`);
        await fetchCompanies();
        
        Swal.fire({
          title: '📧 ¡Token Enviado!',
          html: `
            <div class="text-left">
              <p class="mb-3">${response.data.message}</p>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p class="text-sm text-blue-800">
                  <strong>⏰ Válido hasta:</strong> ${response.data.token_expires_at}
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Entendido'
        });
      } catch (error) {
        console.error('Error sending activation token:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo enviar el token de activación. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleDeactivateCompany = async (companyId, companyName) => {
    const result = await Swal.fire({
      title: '¿Desactivar empresa?',
      html: `¿Está seguro de que desea desactivar la empresa "<strong>${companyName}</strong>"?<br><br><small class="text-gray-500">Esta acción suspenderá el acceso de todos los usuarios de la empresa.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-popup-custom',
        confirmButton: 'swal-button-danger'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/companies/${companyId}/deactivate`);
        await fetchCompanies();
        await fetchStats();
        
        Swal.fire({
          title: '¡Desactivada!',
          text: `La empresa "${companyName}" ha sido desactivada.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deactivating company:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo desactivar la empresa. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleActivateBranch = async (branchId, branchName) => {
    const result = await Swal.fire({
      title: '¿Activar sucursal?',
      html: `¿Está seguro de que desea activar la sucursal "<strong>${branchName}</strong>"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/branches/${branchId}/activate`);
        // Refrescar los datos de la empresa seleccionada
        if (selectedCompany) {
          const response = await api.get(`/admin/companies/${selectedCompany.id}`);
          setSelectedCompany(response.data);
        }
        await fetchCompanies();
        
        Swal.fire({
          title: '¡Activada!',
          text: `La sucursal "${branchName}" ha sido activada.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error activating branch:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo activar la sucursal. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleDeactivateBranch = async (branchId, branchName) => {
    const result = await Swal.fire({
      title: '¿Desactivar sucursal?',
      html: `¿Está seguro de que desea desactivar la sucursal "<strong>${branchName}</strong>"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/admin/branches/${branchId}/deactivate`);
        // Refrescar los datos de la empresa seleccionada
        if (selectedCompany) {
          const response = await api.get(`/admin/companies/${selectedCompany.id}`);
          setSelectedCompany(response.data);
        }
        await fetchCompanies();
        
        Swal.fire({
          title: '¡Desactivada!',
          text: `La sucursal "${branchName}" ha sido desactivada.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deactivating branch:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo desactivar la sucursal. Inténtelo nuevamente.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Administra todas las empresas registradas en el sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_companies || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ToggleRight className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Empresas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active_companies || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ToggleLeft className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_companies || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.companies_this_month || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {companies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron empresas con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            RUT: {company.rut}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.email}</div>
                      <div className="text-sm text-gray-500">{company.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        {company.branches?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => fetchCompanyDetails(company.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {company.is_active ? (
                          <button
                            onClick={() => handleDeactivateCompany(company.id, company.name)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Desactivar"
                          >
                            <ToggleLeft className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateCompany(company.id, company.name)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Activar"
                          >
                            <ToggleRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de {selectedCompany.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">RUT:</span> {selectedCompany.rut}</div>
                    <div><span className="font-medium">Email:</span> {selectedCompany.email}</div>
                    <div><span className="font-medium">Teléfono:</span> {selectedCompany.phone}</div>
                    <div><span className="font-medium">Dirección:</span> {selectedCompany.address}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedCompany.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedCompany.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Usuarios:</span> {selectedCompany.stats?.total_users || 0}</div>
                    <div><span className="font-medium">Sucursales Activas:</span> {selectedCompany.stats?.active_branches || 0}</div>
                    <div><span className="font-medium">Sucursales Pendientes:</span> {selectedCompany.stats?.pending_branches || 0}</div>
                    <div><span className="font-medium">Registrado:</span> {formatDate(selectedCompany.created_at)}</div>
                  </div>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600">{selectedCompany.description}</p>
                </div>
              )}

              {selectedCompany.users && selectedCompany.users.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Usuarios ({selectedCompany.users.length})</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedCompany.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.role} {user.is_company_owner && '(Propietario)'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCompany.branches && selectedCompany.branches.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sucursales ({selectedCompany.branches.length})</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedCompany.branches.map((branch) => (
                      <div key={branch.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{branch.name}</div>
                          <div className="text-xs text-gray-500">{branch.address}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            branch.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {branch.is_active ? 'Activa' : 'Pendiente'}
                          </span>
                          <button
                            onClick={() => branch.is_active 
                              ? handleDeactivateBranch(branch.id, branch.name)
                              : handleActivateBranch(branch.id, branch.name)
                            }
                            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                              branch.is_active 
                                ? 'text-orange-600 hover:text-orange-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={branch.is_active ? 'Desactivar sucursal' : 'Activar sucursal'}
                          >
                            {branch.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
