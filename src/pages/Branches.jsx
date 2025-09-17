import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, MapPin, ToggleLeft, ToggleRight, User, Search, Eye, CheckCircle, AlertTriangle, X, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Swal from 'sweetalert2';

const Branches = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    manager_email: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

 

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      const branchesData = Array.isArray(response.data.data) ? response.data.data : response.data;
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar las sucursales',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);
 useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, formData);
        Swal.fire({
          title: '¡Actualizada!',
          text: 'La sucursal ha sido actualizada correctamente',
          icon: 'success'
        });
      } else {
           const response = await api.post('/branches', formData);
        Swal.fire({
          title: '¡Creada!',
          //Trear respuesta de la API
          text: response.data.message,
          icon: 'success'
        });
      }
      
      fetchBranches();
      resetForm();
      setErrors({});
    } catch (error) {
      console.error('Error saving branch:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar la sucursal',
        icon: 'error'
      });
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code || '',
      address: branch.address,
      phone: branch.phone,
      manager_name: branch.manager_name,
      manager_email: branch.manager_email || '',
      is_active: branch.is_active
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (branch) => {
    const result = await Swal.fire({
      title: '¿Eliminar sucursal?',
      text: `¿Estás seguro de que quieres eliminar la sucursal ${branch.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/branches/${branch.id}`);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La sucursal ha sido eliminada correctamente',
          icon: 'success'
        });
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al eliminar la sucursal',
          icon: 'error'
        });
      }
    }
  };

 

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      manager_name: '',
      manager_email: '',
      is_active: true
    });
    setEditingBranch(null);
    setShowForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Sucursales</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'super_admin' 
              ? 'Administra todas las sucursales del sistema' 
              : 'Administra las sucursales de tu empresa'
            }
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
          Nueva Sucursal
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar sucursales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gerente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-8 w-8 text-indigo-600 mr-3 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                        <div className="text-sm text-gray-500">{branch.email}</div>
                        <div className="text-sm text-gray-500">{branch.phone}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{branch.address}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{branch.manager_name}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      branch.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
               
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(branch)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedBranch(branch)}
                        className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBranches.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron sucursales</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Sucursal *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de la Sucursal *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Ej: SUC001, CENTRO, etc."
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
            
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
               
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
             
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Administrador *
                </label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.manager_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                
                />
                {errors.manager_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.manager_name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del Administrador *
                </label>
                <input
                  type="email"
                  name="manager_email"
                  value={formData.manager_email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.manager_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.manager_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.manager_email[0]}</p>
                )}
              </div>



              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  {editingBranch ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Details Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Sucursal</h3>
              <button
                onClick={() => setSelectedBranch(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-sm text-gray-900">{selectedBranch.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p className={`text-sm font-medium ${selectedBranch.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBranch.is_active ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-sm text-gray-900">{selectedBranch.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm text-gray-900">{selectedBranch.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{selectedBranch.email}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Gerente</label>
                <p className="text-sm text-gray-900">{selectedBranch.manager_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                  <p className="text-sm text-gray-900">
                    {selectedBranch.created_at ? new Date(selectedBranch.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                  <p className="text-sm text-gray-900">
                    {selectedBranch.updated_at ? new Date(selectedBranch.updated_at).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
