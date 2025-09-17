import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiBarChart2, FiEye, FiCheckCircle, FiXCircle, FiSearch, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';

const ProductsManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    
    const [productForm, setProductForm] = useState({
        product_name: '',
        description: '',
        price: '',
        cost_price: '',
        category_id: '',
        stock: '',
        min_stock: '',
        sku: '',
        track_inventory: true,
        allow_zero_stock_sales: false
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/my-products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setProducts(result.data || []);
            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const validateProductName = async (name, productId = null) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8001/api/products/validate-name', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_name: name,
                    product_id: productId
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result.unique;
            }
            return false;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar nombre único
        const isUnique = await validateProductName(productForm.product_name, editingProduct?.id);
        if (!isUnique) {
            Swal.fire('Error', 'Ya existe un producto con este nombre en tu empresa', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = editingProduct 
                ? `http://localhost:8001/api/products/${editingProduct.id}`
                : 'http://localhost:8001/api/products';
            
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productForm)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                setShowForm(false);
                setEditingProduct(null);
                resetForm();
                fetchProducts();
            } else {
                throw new Error(result.message || 'Error al guardar producto');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setProductForm({
            product_name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            cost_price: product.cost_price?.toString() || '',
            category_id: product.category_id?.toString() || '',
            stock: product.stock?.toString() || '',
            min_stock: product.min_stock?.toString() || '',
            sku: product.sku || '',
            track_inventory: product.track_inventory,
            allow_zero_stock_sales: product.allow_zero_stock_sales || false
        });
        setShowForm(true);
    };

    const handleToggleStatus = async (product) => {
        const action = product.is_active ? 'desactivar' : 'activar';
        const result = await Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} producto?`,
            text: `¿Estás seguro de que deseas ${action} este producto?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: product.is_active ? '#dc3545' : '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8001/api/products/${product.id}/toggle-status`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    Swal.fire({
                        title: '¡Éxito!',
                        text: result.message,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    fetchProducts();
                } else {
                    throw new Error('Error al cambiar estado del producto');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const generateBarcode = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8001/api/products/${product.id}/generate-barcode`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: '¡Código de barras generado!',
                    html: `
                        <div style="text-align: center;">
                            <p>Código de barras para <strong>${product.name}</strong></p>
                            <div style="font-size: 24px; font-family: monospace; background: #f8f9fa; padding: 15px; margin: 15px 0; border: 2px solid #dee2e6; border-radius: 5px;">
                                ${result.barcode}
                            </div>
                            <p style="color: #6c757d; font-size: 14px;">Este código puede usarse para generar etiquetas con código de barras</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido'
                });
                fetchProducts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const checkAvailability = async (product) => {
        const { value: quantity } = await Swal.fire({
            title: 'Verificar disponibilidad',
            input: 'number',
            inputLabel: 'Cantidad a verificar',
            inputValue: 1,
            inputAttributes: {
                min: 1,
                step: 1
            },
            showCancelButton: true,
            confirmButtonText: 'Verificar',
            cancelButtonText: 'Cancelar'
        });

        if (quantity) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8001/api/products/${product.id}/check-availability`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantity: parseInt(quantity) })
                });

                if (response.ok) {
                    const result = await response.json();
                    const iconType = result.available ? 'success' : 'warning';
                    const color = result.available ? '#28a745' : '#ffc107';
                    
                    Swal.fire({
                        title: result.available ? 'Producto disponible' : 'Stock insuficiente',
                        html: `
                            <div>
                                <p><strong>Cantidad solicitada:</strong> ${quantity}</p>
                                <p><strong>Stock actual:</strong> ${result.current_stock}</p>
                                <p><strong>Permite venta sin stock:</strong> ${result.allows_zero_stock ? 'Sí' : 'No'}</p>
                                <p style="color: ${color}; font-weight: bold;">${result.message}</p>
                            </div>
                        `,
                        icon: iconType
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudo verificar la disponibilidad', 'error');
            }
        }
    };

    const resetForm = () => {
        setProductForm({
            product_name: '',
            description: '',
            price: '',
            cost_price: '',
            category_id: '',
            stock: '',
            min_stock: '',
            sku: '',
            track_inventory: true,
            allow_zero_stock_sales: false
        });
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !categoryFilter || product.category_id?.toString() === categoryFilter;
        
        const matchesStock = !stockFilter || 
                           (stockFilter === 'in_stock' && product.stock > 0) ||
                           (stockFilter === 'low_stock' && product.stock <= product.min_stock) ||
                           (stockFilter === 'out_of_stock' && product.stock === 0);

        return matchesSearch && matchesCategory && matchesStock;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Nuevo Producto
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos los stocks</option>
                        <option value="in_stock">En stock</option>
                        <option value="low_stock">Stock bajo</option>
                        <option value="out_of_stock">Sin stock</option>
                    </select>

                    <div className="text-sm text-gray-600 flex items-center">
                        {filteredProducts.length} productos encontrados
                    </div>
                </div>
            </div>

            {/* Lista de productos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        {product.description && (
                                            <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${product.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {product.track_inventory ? (
                                                <span className={`
                                                    ${product.stock <= 0 ? 'text-red-600' : 
                                                      product.stock <= product.min_stock ? 'text-yellow-600' : 
                                                      'text-green-600'}
                                                `}>
                                                    {product.stock}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">Sin seguimiento</span>
                                            )}
                                        </div>
                                        {product.allow_zero_stock_sales && (
                                            <div className="text-xs text-blue-600">Permite venta sin stock</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.is_active ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <FiCheckCircle className="mr-1" /> Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <FiXCircle className="mr-1" /> Inactivo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {product.barcode ? (
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                {product.barcode}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => generateBarcode(product)}
                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                            >
                                                <FiBarChart2 className="inline mr-1" />
                                                Generar
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(product)}
                                                className={product.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                                                title={product.is_active ? "Desactivar" : "Activar"}
                                            >
                                                {product.is_active ? <FiXCircle /> : <FiCheckCircle />}
                                            </button>
                                            <button
                                                onClick={() => checkAvailability(product)}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="Verificar disponibilidad"
                                            >
                                                <FiEye />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No se encontraron productos</p>
                    </div>
                )}
            </div>

            {/* Modal para crear/editar producto */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre del producto *</label>
                                    <input
                                        type="text"
                                        value={productForm.product_name}
                                        onChange={(e) => setProductForm({...productForm, product_name: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                                    <input
                                        type="text"
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio de venta *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio de costo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.cost_price}
                                        onChange={(e) => setProductForm({...productForm, cost_price: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stock actual</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stock mínimo</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.min_stock}
                                        onChange={(e) => setProductForm({...productForm, min_stock: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="track_inventory"
                                        checked={productForm.track_inventory}
                                        onChange={(e) => setProductForm({...productForm, track_inventory: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="track_inventory" className="ml-2 block text-sm text-gray-700">
                                        Hacer seguimiento de inventario
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="allow_zero_stock"
                                        checked={productForm.allow_zero_stock_sales}
                                        onChange={(e) => setProductForm({...productForm, allow_zero_stock_sales: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="allow_zero_stock" className="ml-2 block text-sm text-gray-700">
                                        Permitir venta con stock en cero
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsManager;
