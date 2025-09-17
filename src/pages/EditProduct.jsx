import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useCatalogs from '../hooks/useCatalog';
import { productsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, branches, error: catalogsError } = useCatalogs();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    stock: '',
    min_stock: '',
    track_inventory: true,
    is_published: true,  // Cambiado de is_active a is_published
    branch_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar producto
 useEffect(() => {
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getById(id);
      console.log('Respuesta del producto:', response);

      // Extraer el producto correctamente
      const product = response.data?.data ?? response.data;

      setFormData((prev) => ({
        ...prev,
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        cost_price: product.cost_price || '',
        category_id: product.category_id || '',
        stock: product.stock || '',
        min_stock: product.min_stock || '',
        track_inventory: !!product.track_inventory,
        is_published: product.is_published !== undefined ? product.is_published : true,  // Cambiado de is_active a is_published
        branch_id: product.branch_id || '',
      }));
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : 
      name === 'branch_id' || name === 'category_id' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      console.log('Datos que se envían al servidor:', formData);
      const response = await productsAPI.update(id, formData);
      
      if (response.data.success) {
         showSuccess(response.data.message || 'Producto actualizado exitosamente');
        navigate('/dashboard');
      } else {
        // Si hay un error en la respuesta pero no es de validación
        showError(response.data.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.log('Error completo:', error);
      if (error.response?.data?.errors) {
        // Errores de validación del backend
        const validationErrors = error.response.data.errors;
        console.log('Errores de validación:', validationErrors);
        setErrors(validationErrors);
        
        // Mostrar el primer error en el toast
        const firstError = Object.values(validationErrors)[0];
        if (firstError && firstError[0]) {
          showError(firstError[0]);
        }
      } else if (error.response?.data?.message) {
        // Error general del backend
        showError(error.response.data.message);
      } else {
        // Error no controlado
        showError('Error al actualizar el producto');
        console.error('Error updating product:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Editar Producto
      </h1>

      {catalogsError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {catalogsError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.price ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
          </div>

          {/* Precio de costo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio de costo</label>
            <input
              type="number"
              name="cost_price"
              value={formData.cost_price || ''}
              onChange={handleChange}
             className={`mt-1 block w-full rounded-lg border ${errors.cost_price ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            />
            {errors.cost_price && <p className="text-red-500 text-xs mt-1">{errors.cost_price[0]}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.stock ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock[0]}</p>}
          </div>

          {/* Stock mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock mínimo</label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.category_id ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
          </div>

          {/* Sucursal */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sucursal</label>
            <select
              name="branch_id"
              value={formData.branch_id || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${errors.branch_id ? 'border-red-400' : 'border-gray-300'} shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {errors.branch_id && <p className="text-red-500 text-xs mt-1">{errors.branch_id[0]}</p>}
          </div>
        </div>

        {/* Switches */}
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="track_inventory"
              checked={formData.track_inventory || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Rastrear inventario</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="is_published"
              checked={formData.is_published || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Publicado</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
