import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, ArrowRight, Clock, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import api, { productsAPI } from '../services/api';
import Select from 'react-select';


export default function BranchTransfers() {
  const { user } = useAuth();
  
  // Debug logs

  
  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
const [productOptions, setProductOptions] = useState([]);
const [loadingProducts, setLoadingProducts] = useState(false);


  useEffect(() => {
    setCurrentProduct({ product_id: '', quantity: 1 });
  }, [selectedBranch]);
  const [formData, setFormData] = useState({
    from_branch_id: '',
    to_branch_id: '',
    notes: '',
    products: []
  });
  const [currentProduct, setCurrentProduct] = useState({
    product_id: '',
    quantity: 1
  });

  useEffect(() => {
   
    
    if (user && (user.role === 'company_admin' || user.role === 'manager' || user.role === 'employee' || user.role === 'company')) {
      console.log('Loading data...');
      loadTransfers();
      loadBranches();
      loadProducts();
  
    } else {
      console.log('User not authorized or not loaded');
    }
  }, [user]);

  const loadTransfers = async () => {
    try {
      console.log('Loading transfers...');
      const response = await api.get('/branch-transfers');
      console.log('Transfers response:', response.data);
      setTransfers(response.data);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
    
      const response = await api.get('/branches');
    
      
      // Verificar si response.data es un array o tiene propiedades
      let branchesData = response.data;
      if (response.data.data) {
        branchesData = response.data.data;
      }
      
      console.log('Branches data:', branchesData);
      
      const activeBranches = Array.isArray(branchesData) 
        ? branchesData.filter(branch => branch.is_active) 
        : [];
  
      
      setBranches(activeBranches);
    } catch (error) {
      console.error('Error loading branches:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

  const loadProducts = async () => {
    try {

      const response = await api.get('/my-products');
 
      
      // Verificar si response.data es un array o tiene propiedades
      let productsData = response.data;
      if (response.data.data) {
        productsData = response.data.data;
      }
      

      
      const finalProducts = Array.isArray(productsData) ? productsData : [];
      console.log('Final products array:', finalProducts);
      
      setProducts(finalProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

const fetchProductOptions = async (inputValue = '') => {
  try {
    setLoadingProducts(true);

    const res = await productsAPI.getAllForSelect({
      q: inputValue,
      branch_id: formData.from_branch_id
    });

 const options = (res.data?.data ?? [])
  .filter(p => typeof p.label === 'string' && p.label.length > 0)
  .map(p => ({
    value: p.value,
    label: String(p.label), // fuerza a string
    stock: p.stock
  }));
    setProductOptions(options);
    return options;
  } catch (error) {
    console.error('Error cargando productos:', error);
    setProductOptions([]);
    return [];
  } finally {
    
    setLoadingProducts(false);
  }
};


useEffect(() => {
  if (formData.from_branch_id) {
    fetchProductOptions();
  } else {
    setProductOptions([]);
  }
}, [formData.from_branch_id]);


  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    
    if (!formData.from_branch_id || !formData.to_branch_id) {
      Swal.fire('Error', 'Debe seleccionar sucursal origen y destino', 'error');
      return;
    }

    if (formData.from_branch_id === formData.to_branch_id) {
      Swal.fire('Error', 'La sucursal de origen debe ser diferente a la de destino', 'error');
      return;
    }

    if (formData.products.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un producto', 'error');
      return;
    }

    // Validar stock para cada producto
    for (const item of formData.products) {
      const selectedProduct = products.find(p => p.id == item.product_id && p.branch_id == selectedBranch);
      const availableStock = selectedProduct?.stock || 0;
      
      if (item.quantity > availableStock) {
        Swal.fire('Error', `${selectedProduct?.product_name || 'Producto'}: No hay suficiente stock. Stock disponible: ${availableStock} unidades`, 'error');
        return;
      }

      if (item.quantity < 1) {
        Swal.fire('Error', 'Todas las cantidades deben ser mayores a 0', 'error');
        return;
      }
    }

    try {
      // Crear traslados individuales para cada producto
      for (const item of formData.products) {
        await api.post('/branch-transfers', {
          product_id: item.product_id,
          from_branch_id: formData.from_branch_id,
          to_branch_id: formData.to_branch_id,
          quantity: item.quantity,
          notes: formData.notes
        });
      }
      
      Swal.fire('Éxito', `${formData.products.length} solicitudes de traslado creadas exitosamente`, 'success');
      setShowCreateModal(false);
      setFormData({
        from_branch_id: '',
        to_branch_id: '',
        notes: '',
        products: []
      });
      setCurrentProduct({
        product_id: '',
        quantity: 1
      });
      loadTransfers();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear las solicitudes';
      Swal.fire('Error', message, 'error');
    }
  };

  const addProductToTransfer = () => {
    if (!currentProduct.product_id) {
      Swal.fire('Error', 'Seleccione un producto', 'error');
      return;
    }

    // Verificar si el producto ya está en la lista
    if (formData.products.some(p => p.product_id === currentProduct.product_id)) {
      Swal.fire('Error', 'Este producto ya está en la lista', 'error');
      return;
    }

    // Validar stock
    const selectedProduct = products.find(p => p.id == currentProduct.product_id && p.branch_id == selectedBranch);
    const availableStock = selectedProduct?.stock || 0;

    if (currentProduct.quantity > availableStock) {
      Swal.fire('Error', `Stock insuficiente. Disponible: ${availableStock} unidades`, 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...currentProduct }]
    }));

    setCurrentProduct({
      product_id: '',
      quantity: 1
    });

    Swal.fire('Agregado', 'Producto agregado correctamente', 'success');
  };

  const removeProductFromTransfer = (index) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const handleApprove = async (transferId) => {
    try {
      const result = await Swal.fire({
        title: '¿Aprobar traslado?',
        text: 'Esta acción aprobará la solicitud de traslado',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aprobar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await api.patch(`/branch-transfers/${transferId}/approve`);
        Swal.fire('Éxito', 'Traslado aprobado exitosamente', 'success');
        loadTransfers();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al aprobar el traslado';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleComplete = async (transferId) => {
    try {
      const result = await Swal.fire({
        title: '¿Completar traslado?',
        text: 'Esta acción moverá el producto a la sucursal destino',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Completar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await api.patch(`/branch-transfers/${transferId}/complete`);
        Swal.fire('Éxito', 'Traslado completado exitosamente', 'success');
        loadTransfers();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al completar el traslado';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleReject = async (transferId) => {
    try {
      const { value: reason } = await Swal.fire({
        title: '¿Rechazar traslado?',
        input: 'textarea',
        inputLabel: 'Motivo del rechazo (opcional)',
        inputPlaceholder: 'Escribe el motivo...',
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar'
      });

      if (reason !== undefined) {
        await api.patch(`/branch-transfers/${transferId}/reject`, {
          rejection_reason: reason
        });
        Swal.fire('Éxito', 'Traslado rechazado', 'success');
        loadTransfers();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al rechazar el traslado';
      Swal.fire('Error', message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', text: 'Aprobado', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completado', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rechazado', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const filteredProducts = selectedBranch 
    ? products.filter(product => product.branch_id == selectedBranch)
    : [];

  console.log('Filtered products debug:', {
    selectedBranch,
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
    productsWithBranchId: products.filter(p => p.branch_id).length,
    sampleProduct: products[0]
  });

  if (user?.role === 'super_admin' || !user?.company_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin acceso</h3>
          <p className="mt-1 text-sm text-gray-500">
            Solo las empresas pueden gestionar traslados entre sucursales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Traslados entre Sucursales</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona el traslado de productos entre tus sucursales
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Debug: {branches.length} sucursales, {products.length} productos cargados
              </p>
            </div>
            <button
              onClick={() => {
                console.log('Botón Nuevo Traslado clickeado');
                console.log('showCreateModal antes:', showCreateModal);
                setShowCreateModal(true);
                console.log('setShowCreateModal(true) ejecutado');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Traslado</span>
            </button>
          </div>
        </div>

        {/* Transfers List */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando traslados...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay traslados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primera solicitud de traslado.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Traslado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transfer.product?.title || transfer.product?.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <span className="truncate max-w-20">
                              {transfer.from_branch?.name}
                            </span>
                            <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                            <span className="truncate max-w-20">
                              {transfer.to_branch?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transfer.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transfer.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {transfer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(transfer.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleReject(transfer.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {transfer.status === 'approved' && (
                            <button
                              onClick={() => handleComplete(transfer.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Completar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          {console.log('Modal renderizado, showCreateModal:', showCreateModal)}
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Solicitud de Traslado - Múltiples Productos
              </h3>
              <form onSubmit={handleCreateTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sucursal Origen
                    </label>
                    <select
                      value={formData.from_branch_id}
                      onChange={(e) => {
                        setFormData({ ...formData, from_branch_id: e.target.value });
                        setSelectedBranch(e.target.value);
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Seleccionar sucursal ({branches.length} disponibles)</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sucursal Destino
                    </label>
                    <select
                      value={formData.to_branch_id}
                      onChange={(e) => setFormData({ ...formData, to_branch_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Seleccionar sucursal</option>
                      {branches
                        .filter(branch => branch.id != formData.from_branch_id)
                        .map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Sección para agregar productos */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Agregar Productos ({filteredProducts.length} disponibles)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                  <Select
  options={productOptions}                    // ✅ Ahora sí, es un array real
  isLoading={loadingProducts}
  isDisabled={!formData.from_branch_id}       // ❌ No selecciona si no hay sucursal
  value={
    productOptions.find(opt => opt.value === currentProduct.product_id) || null
  }
  onInputChange={(value) => fetchProductOptions(value)} // ✅ Búsqueda dinámica
  onChange={(selected) =>
    setCurrentProduct({
      ...currentProduct,
      product_id: selected ? selected.value : '',
      stock: selected ? selected.stock : 0
    })
  }
  placeholder={
    formData.from_branch_id
      ? "Seleccionar producto"
      : "Seleccione primero una sucursal"
  }
  isClearable
/>

                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={currentProduct.quantity}
                        onChange={(e) => setCurrentProduct({ 
                          ...currentProduct, 
                          quantity: parseInt(e.target.value) || 1
                        })}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Cantidad"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addProductToTransfer}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    disabled={!currentProduct.product_id}
                  >
                    + Agregar Producto
                  </button>
                </div>

                {/* Lista de productos agregados */}
                {formData.products.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Productos a Trasladar ({formData.products.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.products.map((item, index) => {
                        const product = filteredProducts.find(p => p.id == item.product_id);
                        return (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex-1">
                              <span className="font-medium">{product?.product_name || product?.title}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProductFromTransfer(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Información adicional sobre el traslado..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        from_branch_id: '',
                        to_branch_id: '',
                        notes: '',
                        products: []
                      });
                      setCurrentProduct({
                        product_id: '',
                        quantity: 1
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formData.products.length === 0}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Crear {formData.products.length > 0 ? formData.products.length : ''} Traslado{formData.products.length > 1 ? 's' : ''}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
