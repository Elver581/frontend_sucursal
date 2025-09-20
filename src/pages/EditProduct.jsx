import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useCatalogs from "../hooks/useCatalog";
import { productsAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log("Usuario actual:", user); // 👈 Verifica el usuario
  const { categories, branches, error: catalogsError } = useCatalogs();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    category_id: "",
    min_stock: "",
    track_inventory: true,
    is_published: true,
    branches: [] // 👈 sucursales con stock y precio
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsAPI.getById(id);
        const product = response.data?.data ?? response.data;

        setFormData((prev) => ({
          ...prev,
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          cost_price: product.cost_price || "",
          category_id: product.category_id || "",
          min_stock: product.min_stock || "",
          track_inventory: !!product.track_inventory,
          is_published: product.is_published ?? true,
          branches: (product.branches || []).map((b) => ({
            id: b.id,
            stock: b.pivot?.stock || 0,
            price: b.pivot?.price || 0,
          })),
        }));
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "category_id"
          ? parseInt(value, 10)
          : value,
    });
  };

  const handleBranchChange = (branchId, field, value) => {
    const updatedBranches = formData.branches.some((b) => b.id === branchId)
      ? formData.branches.map((b) =>
          b.id === branchId ? { ...b, [field]: value } : b
        )
      : [...formData.branches, { id: branchId, stock: 0, price: 0, [field]: value }];

    setFormData({ ...formData, branches: updatedBranches });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await productsAPI.update(id, formData);

      if (response.data.success) {
        showSuccess(response.data.message || "Producto actualizado exitosamente");
        navigate("/dashboard");
      } else {
        showError(response.data.message || "Error al actualizar el producto");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);
        const firstError = Object.values(validationErrors)[0];
        if (firstError && firstError[0]) showError(firstError[0]);
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError("Error al actualizar el producto");
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
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{catalogsError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${
                errors.name ? "border-red-400" : "border-gray-300"
              } shadow-sm p-2`}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Precio Base</label>
            <input
              type="number"
              name="price"
              value={formData.price || ""}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border ${
                errors.price ? "border-red-400" : "border-gray-300"
              } shadow-sm p-2`}
            />
            {errors.price && <p className="text-red-500 text-xs">{errors.price[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Precio de Costo</label>
            <input
              type="number"
              name="cost_price"
              value={formData.cost_price || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            name="category_id"
            value={formData.category_id || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm p-2"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sucursales dinámicas */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Sucursales</h2>
          {branches.map((branch) => {
            const branchData =
              formData.branches.find((b) => b.id === branch.id) || {
                id: branch.id,
                stock: 0,
                price: 0,
              };

            return (
           <div key={branch.id} className="mb-4 p-4 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
  <span className="block font-semibold text-blue-700 mb-2 text-lg">{branch.name}</span>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label htmlFor={`branch-${branch.id}-stock`} className="block text-sm text-gray-600 mb-1">
        Stock en {branch.name}
      </label>
      <input
        id={`branch-${branch.id}-stock`}
        type="number"
        min={0}
        placeholder="Ej: 100"
        value={branchData.stock}
        onChange={(e) =>
          handleBranchChange(branch.id, "stock", parseInt(e.target.value, 10) || 0)
        }
        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label htmlFor={`branch-${branch.id}-price`} className="block text-sm text-gray-600 mb-1">
        Precio en {branch.name}
      </label>
      <input
        id={`branch-${branch.id}-price`}
        type="number"
        min={0}
        step="0.01"
        placeholder="Ej: 4500"
        value={branchData.price}
        onChange={(e) =>
          handleBranchChange(branch.id, "price", parseFloat(e.target.value) || 0)
        }
        className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
      />
    </div>
  </div>
</div>
            );
          })}
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
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
