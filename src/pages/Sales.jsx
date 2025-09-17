import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Receipt, Calculator, DollarSign, Package, Building2, FileText, Smartphone, Coins } from 'lucide-react';
import { productsAPI, salesAPI, paymentMethodsAPI,companiesAPI, branchesAPI, 

 } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useParams } from 'react-router-dom';
const Sales = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { branchId } = useParams();



  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [customerPaid, setCustomerPaid] = useState('');
  const [change, setChange] = useState(0);
  const [company, setCompany] = useState(null);
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    loadProducts();
    loadPaymentMethods();
      (async () => {
    try {
      const res = await companiesAPI.getMyCompany();
      const c = res?.data?.data ?? res?.data;
      setCompany(c);
    } catch (e) { console.error('Error al cargar empresa:', e); }
  })();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAllByBranch(branchId);

      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentMethodsAPI.getAll();
      setPaymentMethods(response.data);
      // Seleccionar efectivo por defecto
      const efectivo = response.data.find(pm => pm.name === 'Efectivo');
      if (efectivo) setSelectedPaymentMethod(efectivo);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('No hay suficiente stock disponible');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  useEffect(() => {
    if (selectedPaymentMethod?.name === 'Efectivo' && customerPaid) {
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const paidAmount = parseFloat(customerPaid) || 0;
      const newChange = paidAmount >= total ? paidAmount - total : 0;
      setChange(newChange);
    } else {
      setChange(0);
    }
  }, [customerPaid, cart, selectedPaymentMethod]);


  useEffect(()=>{
    if(branchId){
      branchesAPI.getById(branchId)
        .then(res => setBranch(res.data))
        .catch(err => {
          console.error('Error al cargar sucursal:', err);
          setBranch({ error: true });
        });
    }
    
  },[branchId]);


  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Selecciona un método de pago');
      return;
    }

    // Validar que todos los items tengan precio válido
    const invalidItems = cart.filter(item => !item.price || item.price <= 0);
    if (invalidItems.length > 0) {
      toast.error('Todos los productos deben tener un precio válido');
      return;
    }

    const total = getTotal();
    if (selectedPaymentMethod.name === 'Efectivo') {
      const paid = parseFloat(customerPaid) || 0;
      if (paid < total) {
        toast.error('El monto pagado es insuficiente');
        return;
      }
    }

    setLoading(true);

    try {
      const total = getTotal();
      const amountPaid = selectedPaymentMethod.name === 'Efectivo' ? parseFloat(customerPaid) || total : total;
      const changeGiven = selectedPaymentMethod.name === 'Efectivo' ? Math.max(0, amountPaid - total) : 0;

      const saleData = {
        items: cart.map(item => ({
          branchId: branchId,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          

        })),
        payment_method_id: selectedPaymentMethod.id,
        amount_paid: amountPaid,
        change_given: changeGiven,
        customer_name: '', // Opcional
        customer_phone: '', // Opcional  
        notes: '' // Opcional
      };

      const response = await salesAPI.create(saleData);
      
      if (response.data.success) {
        setLastSale({
          ...response.data.data,
          items: cart,
          payment_method: selectedPaymentMethod,
          amount_paid: saleData.amount_paid,
          change_given: saleData.change_given,
          seller_name: user?.name || 'Desconocido'
        });
        
        // Limpiar carrito y campos
        setCart([]);
        setCustomerPaid('');
        setChange(0);
        
        // Mostrar ticket
        setShowTicket(true);
        
        // Toast de éxito
        toast.success('Venta registrada exitosamente');
        
        // Recargar productos para actualizar stock
        loadProducts();
      }
    } catch (error) {
      console.error('Error al procesar venta:', error);
      const errorMessage = error.response?.data?.message || 'Error desconocido';
      toast.error('Error al procesar la venta: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

const filteredProducts = products.filter(product =>
  product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
);


  const printTicket = () => {
    window.print();
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




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Ventas</h1>
        
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Productos Disponibles
                </h2>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                    }`}
                    onClick={() => addToCart(product)}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{product.product_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toLocaleString()}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Carrito y Pago */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Carrito de Ventas
              </h2>

              {/* Items del carrito */}
              <div className="max-h-64 overflow-y-auto mb-6">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrito vacío</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">${item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-red-500"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-green-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-500 hover:text-red-500 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${getTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Métodos de Pago */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Método de Pago
                </h3>
                {paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method)}
                        className={`p-3 rounded-lg border text-sm transition-all ${
                          selectedPaymentMethod?.id === method.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{getIcon(method.type)}</div>
                          <div>{method.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-2">No hay métodos de pago configurados</p>
                      <p>Tu empresa necesita configurar al menos un método de pago para poder realizar ventas.</p>
                      <p className="mt-2">
                        Ve a <span className="font-semibold">Configuración → Métodos de Pago</span> para añadir métodos de pago.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Campo para monto pagado (solo efectivo) */}
              {selectedPaymentMethod?.name === 'Efectivo' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Recibido
                  </label>
                  <input
                    type="number"
                    value={customerPaid}
                    onChange={(e) => setCustomerPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {change > 0 && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Cambio a entregar: ${change.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de procesar venta */}
              <button
                onClick={processSale}
                disabled={loading || cart.length === 0 || paymentMethods.length === 0 || !selectedPaymentMethod}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Receipt className="h-5 w-5" />
                    <span>Procesar Venta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ticket */}
      {showTicket && lastSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-auto">
            {/* Ticket Content */}
            <div className="p-6" id="ticket-content">
            <div className="text-center mb-6">
  {company?.logo_url && (
    <img
      src={company.logo_url}
      alt="Logo"
      className="mx-auto h-16 mb-2 object-contain"
    />
  )}
  <h2 className="text-2xl font-bold text-gray-900 mb-1">
    {company?.name || 'Mi Empresa'}
  </h2>
 <p className="text-xs text-gray-600">{branch?.name || 'Sucursal sin nombre'}</p>

  {company?.rut && <p className="text-xs text-gray-600">RUT/NIT: {company.rut}</p>}
  {company?.address && <p className="text-xs text-gray-600">{company.address}</p>}
  {company?.phone && <p className="text-xs text-gray-600">Tel: {company.phone}</p>}

  <p className="text-sm text-gray-600 mt-2">Ticket #: {lastSale.id}</p>
  <p className="text-sm text-gray-600">
    Fecha: {new Date(lastSale.created_at || new Date()).toLocaleString()}
  </p>
</div>


              <div className="border-t border-b border-dashed border-gray-400 py-4 mb-4">
                {lastSale.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        ${item.price.toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(lastSale.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${(lastSale.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de Pago:</span>
                  <span>{lastSale.payment_method.name}</span>
                </div>
                {lastSale.payment_method.name === 'Efectivo' && (
                  <>
                    <div className="flex justify-between">
                      <span>Recibido:</span>
                      <span>${(lastSale.amount_paid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cambio:</span>
                      <span>${(lastSale.change_given || 0).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <div>Atendido por: {lastSale.seller_name || 'Desconocido'}</div>
                <p>¡Gracias por su compra!</p>
                <p>Vuelva pronto</p>
              </div>
            </div>

            {/* Botones del modal */}
            <div className="flex space-x-4 p-6 pt-0">
              <button
                onClick={printTicket}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Imprimir
              </button>
              <button
                onClick={() => setShowTicket(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
