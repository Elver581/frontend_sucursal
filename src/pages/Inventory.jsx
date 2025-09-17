import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { Package, TrendingDown, AlertTriangle, Plus, Edit, Search, Filter, BarChart3, Eye, DollarSign } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [showAddStock, setShowAddStock] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ quantity: '', operation: 'add' });

  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    topSellingCategories: []
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getMyProducts(1);
      const products = response.data.data;

      // Simular datos de inventario con stock y valores
      const inventoryData = products.map(product => ({
        ...product,
        stock: Math.floor(Math.random() * 50) + 1, // Stock simulado entre 1-50
        minStock: 5, // Stock mínimo
        unitCost: parseFloat(product.price) * 0.7, // Costo unitario (70% del precio)
        lastRestockDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        sold: Math.floor(Math.random() * 20), // Unidades vendidas
        reserved: Math.floor(Math.random() * 5) // Unidades reservadas
      }));

      setInventory(inventoryData);

      // Calcular estadísticas
      const stats = {
        totalProducts: inventoryData.length,
        totalValue: inventoryData.reduce((sum, item) => sum + (item.stock * item.unitCost), 0),
        lowStock: inventoryData.filter(item => item.stock <= item.minStock && item.stock > 0).length,
        outOfStock: inventoryData.filter(item => item.stock === 0).length,
        topSellingCategories: getTopCategories(inventoryData)
      };

      setInventoryStats(stats);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopCategories = (data) => {
    const categoryStats = {};
    data.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { category: item.category, sold: 0, value: 0 };
      }
      categoryStats[item.category].sold += item.sold || 0;
      categoryStats[item.category].value += item.sold * parseFloat(item.price);
    });

    return Object.values(categoryStats)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && item.stock <= item.minStock && item.stock > 0) ||
                        (stockFilter === 'out' && item.stock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleStockUpdate = async (productId) => {
    const product = inventory.find(p => p.id === productId);
    const newQuantity = parseInt(stockUpdate.quantity);
    
    if (isNaN(newQuantity) || newQuantity <= 0) {
      alert('Cantidad inválida');
      return;
    }

    const updatedStock = stockUpdate.operation === 'add' 
      ? product.stock + newQuantity 
      : Math.max(0, product.stock - newQuantity);

    setInventory(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, stock: updatedStock, lastRestockDate: new Date() }
          : item
      )
    );

    setShowAddStock(null);
    setStockUpdate({ quantity: '', operation: 'add' });
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Agotado' };
    if (item.stock <= item.minStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Stock Bajo' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Disponible' };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [...new Set(inventory.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Control de Inventarios</h1>
            <p className="text-gray-600 mt-1">Gestiona tu stock y productos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(inventoryStats.totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Agotados</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryStats.outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todo el stock</option>
              <option value="low">Stock bajo</option>
              <option value="out">Agotados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Productos en Inventario</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio/Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Ingreso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.images && item.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={Array.isArray(item.images) ? item.images[0] : JSON.parse(item.images || '[]')[0]}
                              alt={item.name}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.stock} / {item.minStock} min
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                      {item.reserved > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {item.reserved} reservados
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{formatPrice(item.price)}</div>
                        <div className="text-gray-500">{formatPrice(item.unitCost)} costo</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.sold}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.stock * item.unitCost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.lastRestockDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAddStock(item.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Actualizar stock"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 p-1" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showAddStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actualizar Stock</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operación
                  </label>
                  <select
                    value={stockUpdate.operation}
                    onChange={(e) => setStockUpdate({...stockUpdate, operation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Agregar al stock</option>
                    <option value="subtract">Reducir stock</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={stockUpdate.quantity}
                    onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                    placeholder="0"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddStock(null);
                    setStockUpdate({ quantity: '', operation: 'add' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleStockUpdate(showAddStock)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
