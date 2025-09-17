import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, CreditCard, Building2, Smartphone, FileText, Coins, ToggleLeft, ToggleRight, Star, StarOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Swal from 'sweetalert2';

const PaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    details: {
      account_number: '',
      bank_name: '',
      provider: '',
      commission_rate: ''
    },
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchPaymentTypes();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/payment-methods');
      setPaymentMethods(Array.isArray(response.data.data) ? response.data.data : response.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const response = await api.get('/payment-methods/types');
      setPaymentTypes(response.data);
    } catch (error) {
      console.error('Error fetching payment types:', error);
    }
  };

  const getIcon = (type) => {
    const icons = {
      'efectivo': DollarSign,
      'tarjeta_credito': CreditCard,
      'tarjeta_debito': CreditCard,
      'transferencia': Building2,
      'cheque': FileText,
      'digital_wallet': Smartphone,
      'crypto': Coins
    };
    
    const Icon = icons[type] || DollarSign;
    return <Icon className="w-5 h-5" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'efectivo': 'bg-green-100 text-green-800',
      'tarjeta_credito': 'bg-blue-100 text-blue-800',
      'tarjeta_debito': 'bg-purple-100 text-purple-800',
      'transferencia': 'bg-orange-100 text-orange-800',
      'cheque': 'bg-gray-100 text-gray-800',
      'digital_wallet': 'bg-indigo-100 text-indigo-800',
      'crypto': 'bg-yellow-100 text-yellow-800'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMethod) {
        await api.put(`/payment-methods/${editingMethod.id}`, formData);
      } else {
        await api.post('/payment-methods', formData);
      }
      
      await fetchPaymentMethods();
      resetForm();
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Error al guardar el método de pago');
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description || '',
      details: method.details || {
        account_number: '',
        bank_name: '',
        provider: '',
        commission_rate: ''
      },
      is_active: method.is_active,
      is_default: method.is_default
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });

    if (result.isConfirmed) {
      await api.delete(`/payment-methods/${id}`);
      await fetchPaymentMethods();
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
  }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/payment-methods/${id}/toggle-status`);
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/payment-methods/${id}/default`);
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      details: {
        account_number: '',
        bank_name: '',
        provider: '',
        commission_rate: ''
      },
      is_active: true,
      is_default: false
    });
    setEditingMethod(null);
    setShowForm(false);
  };

  const selectedType = paymentTypes.find(type => type.value === formData.type);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona los métodos de pago disponibles para tu empresa
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Método
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Efectivo Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="">Seleccionar tipo</option>
                {paymentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción del método de pago"
              />
            </div>

            {/* Detalles adicionales */}
            {selectedType?.requires_details && (
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-3">Detalles Adicionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === 'transferencia' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Cuenta
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.details.account_number}
                          onChange={(e) => setFormData({
                            ...formData, 
                            details: {...formData.details, account_number: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Banco
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.details.bank_name}
                          onChange={(e) => setFormData({
                            ...formData, 
                            details: {...formData.details, bank_name: e.target.value}
                          })}
                        />
                      </div>
                    </>
                  )}

                  {(formData.type === 'digital_wallet' || formData.type === 'crypto') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.details.provider}
                        onChange={(e) => setFormData({
                          ...formData, 
                          details: {...formData.details, provider: e.target.value}
                        })}
                        placeholder={formData.type === 'digital_wallet' ? 'Ej: PayPal, Mercado Pago' : 'Ej: Bitcoin, Ethereum'}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tasa de Comisión (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.details.commission_rate}
                      onChange={(e) => setFormData({
                        ...formData, 
                        details: {...formData.details, commission_rate: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Activo</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                />
                <span className="ml-2 text-sm text-gray-700">Predeterminado</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingMethod ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de métodos de pago */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {paymentMethods.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay métodos de pago</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer método de pago.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predeterminado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentMethods.map((method) => (
                  <tr key={method.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getIcon(method.type)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {method.name}
                          </div>
                          {method.description && (
                            <div className="text-sm text-gray-500">
                              {method.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(method.type)}`}>
                        {paymentTypes.find(t => t.value === method.type)?.label || method.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(method.id)}
                        className="flex items-center"
                      >
                        {method.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-500" />
                            <span className="ml-1 text-sm text-green-700">Activo</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-500">Inactivo</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="flex items-center"
                      >
                        {method.is_default ? (
                          <>
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm text-yellow-700">Predeterminado</span>
                          </>
                        ) : (
                          <>
                            <StarOff className="w-5 h-5 text-gray-400" />
                            <span className="ml-1 text-sm text-gray-500">Establecer</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(method)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
