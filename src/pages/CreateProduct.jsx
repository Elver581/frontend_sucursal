import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI, categoriesAPI } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import {
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import useCatalogs from "../hooks/useCatalog";
import Select from "react-select";

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",            // <-- requerido por backend
    cost_price: "",
    category_id: "",
    min_stock: "",        // umbral de alerta (no pivot)
    track_inventory: true,
    is_published: true,   // <-- mapea a backend
    // Campos nuevos
    allows_decimal_stock: false, // permite decimales en stock (boolean)
    pack_unit: "",        // unidad de empaque (entero)
    pack_quantity: "",    // cantidad por empaque (entero)
    branches: [],         // [{ id, stock, price }]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const { branches } = useCatalogs();

  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        const data = res?.data ?? res;
        if (data?.success) {
          setCategories(data.data ?? []);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
        showError("No se pudieron cargar las categorías");
      }
    };
    fetchCategories();
  }, [showError]);

  const getFieldError = (fieldName) => (errors[fieldName] ? errors[fieldName][0] : null);

  // Lee errores como branches.0.stock
  const getNestedError = (prefix, index, field) => {
    const key = `${prefix}.${index}.${field}`;
    return errors[key]?.[0] || null;
  };

  const calculateProfitMargin = () => {
    const price = parseFloat(formData.price) || 0;
    const cost = parseFloat(formData.cost_price) || 0;
    if (price > 0 && cost > 0 && cost < price) {
      const margin = (((price - cost) / cost) * 100).toFixed(1);
      return `${margin}% de ganancia`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.name || !formData.category_id) {
      setLoading(false);
      setErrors({
        name: !formData.name ? ["El nombre es obligatorio"] : undefined,
        category_id: !formData.category_id ? ["La categoría es obligatoria"] : undefined,
      });
      showError("Por favor completa los campos obligatorios");
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price !== "" ? Number.parseFloat(formData.price) : 0,
        cost_price: formData.cost_price !== "" ? Number.parseFloat(formData.cost_price) : null,
        category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
        min_stock: formData.min_stock !== "" ? Number.parseInt(formData.min_stock) : 0,
        track_inventory: !!formData.track_inventory,
        is_published: !!formData.is_published,
        branches: formData.branches.map((b) => ({
          id: Number(b.id),
        stock:
          b.stock === "" ? 0 : formData.allows_decimal_stock ? Number.parseFloat(b.stock) : Number.parseInt(b.stock, 10),
        price:
          b.price === "" || b.price == null ? null : formData.allows_decimal_stock ? Number.parseFloat(b.price) : Number.parseInt(b.price, 10),
      })),
    };
    // Agregar campos nuevos si tienen valor
    if (formData.pack_quantity !== "") {
      productData.pack_quantity = Number.parseInt(formData.pack_quantity);
      }
      if (formData.pack_unit !== "") {
        productData.pack_unit = Number.parseInt(formData.pack_unit);
      }
      if (formData.allows_decimal_stock !== "") {
        productData.allows_decimal_stock = !!formData.allows_decimal_stock;
      }

      const res = await productsAPI.create(productData);
      const data = res?.data ?? res;
      const status = res?.status ?? 200;

      const ok =
        data?.success === true ||
        [200, 201].includes(status) ||
        !!data?.id ||
        !!data?.product?.id;

      if (ok) {
        showSuccess(data?.message || "Producto creado exitosamente");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        const msg = data?.message || "No se pudo crear el producto";
        setErrors({ general: msg });
        showError(msg);
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors || {};
        setErrors(validationErrors);
        showError("Por favor corrige los errores en el formulario");
      } else if (error.response?.status === 500) {
        setErrors({ general: "Error interno del servidor. Intente nuevamente." });
        showError("Error interno del servidor");
      } else {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Error al crear el producto";
        setErrors({ general: msg });
        showError(msg);
      }
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (formData.price === "" || formData.price == null) return;

  setFormData(prev => {
    const updatedBranches = prev.branches.map(b => {
      if (b.price === "" || b.price == null) {
        return { ...b, price: parseFloat(formData.price) };
      }
      return b;
    });
    return { ...prev, branches: updatedBranches };
  });
}, [formData.price]);
useEffect(() => {
  setFormData(prev => {
    const castStock = (v) => {
      if (v === "" || v == null) return "";
      return prev.allows_decimal_stock ? parseFloat(v) : parseInt(v, 10);
    };
    return {
      ...prev,
      stock: castStock(prev.stock),
      min_stock: castStock(prev.min_stock),
      branches: prev.branches.map(b => ({ ...b, stock: castStock(b.stock) })),
    };
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [formData.allows_decimal_stock]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Dashboard
          </button>

          <div className="flex items-center mb-2">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Agregar Nuevo Producto
            </h1>
          </div>
          <p className="text-gray-600">
            Complete la información del producto para agregarlo a su inventario.
          </p>
        </div>

        {/* Error General */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Información Básica
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError("name")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: Bolsa para residuos 70x90 cm"
                />
                {getFieldError("name") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("name")}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Categoría *
                </label>
                <div className="flex gap-2">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError("category_id")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => navigate("/categories/create")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Crear nueva categoría"
                  >
                    +
                  </button>
                </div>
                {categories.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No hay categorías disponibles.
                    <button
                      type="button"
                      onClick={() => navigate("/categories/create")}
                      className="text-green-600 hover:underline ml-1"
                    >
                      Crear la primera categoría
                    </button>
                  </p>
                )}
                {getFieldError("category_id") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("category_id")}
                  </p>
                )}
              </div>



              {/* Nuevos campos */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad por Presentacion</label>
                  <input
                    type="number"
                    name="pack_quantity"
                    value={formData.pack_quantity}
                    onChange={handleChange}
                    min={1}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError("pack_quantity")
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Ej: 6"
                  />
                  {getFieldError("pack_quantity") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("pack_quantity")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad de Presentacion</label>
                 <select
                 name="pack_unit"
                 value={formData.pack_unit}
                 onChange={handleChange}
                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                   getFieldError("pack_unit")
                     ? "border-red-300 bg-red-50"
                     : "border-gray-300"
                 }`}
                 >
                   <option value="">Seleccionar unidad</option>
                   <option value="1">Unidad</option>
                   <option value="1000">Kilogramo</option>
          
                 </select>
                </div>
         

         <div className="flex items-center">
          <input
            type="checkbox"
            id="allows_decimal_stock"
            name="allows_decimal_stock"
            checked={formData.allows_decimal_stock}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allows_decimal_stock" className="ml-2 block text-sm text-gray-700">
            Permitir stock con decimales
          </label>
         </div>

              </div>

                    {/* Información Financiera */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Información Financiera
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precio de Venta */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Precio de Venta * (COP)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError("price")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="150000"
                />
                {getFieldError("price") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("price")}
                  </p>
                )}
              </div>

              {/* Precio de Costo */}
              <div>
                <label
                  htmlFor="cost_price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Precio de Costo (COP)
                </label>
                <input
                  type="number"
                  id="cost_price"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    getFieldError("cost_price")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="100000"
                />
                {getFieldError("cost_price") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("cost_price")}
                  </p>
                )}
              </div>

              {/* Margen de Ganancia */}
              {calculateProfitMargin() && (
                <div className="md:col-span-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800">
                        Margen de Ganancia
                      </h4>
                      <p className="text-green-700">
                        {calculateProfitMargin()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

              {/* Sucursales (multi) + pivote */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursales (stock y precio por sucursal)
                </label>
                <Select
                  isMulti
                  name="branches"
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                  value={formData.branches.map((b) => ({
                    value: b.id,
                    label: branches.find((br) => br.id === b.id)?.name || b.id,
                  }))}
                  onChange={(selected) => {
                    const updated = (selected || []).map((sel) => {
                      const found = formData.branches.find(
                        (b) => b.id === sel.value
                      );
                      return (
                        found || {
                          id: sel.value,
                          stock: 0,
                          price: formData.price || 0,

                        }
                      );
                    });
                    setFormData({ ...formData, branches: updated });
                    if (errors["branches"]) {
                      setErrors((prev) => ({ ...prev, branches: undefined }));
                    }
                  }}
                />
                {errors.branches && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.branches[0]}
                  </div>
                )}

                {formData.branches.length > 0 && (
                  <div className="mt-4">
                    <label className="block font-semibold mb-2">
                      Stock y precio por sucursal
                    </label>
                    {formData.branches.map((branch, idx) => (
                      <div key={branch.id} className="mb-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="font-semibold min-w-[140px]">
                            {branches.find((b) => b.id === branch.id)?.name ||
                              branch.id}
                          </span>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor={`stock-${branch.id}`}>Stock</label>
                            <input
                              type="number"
                              min={0}
                              id={`stock-${branch.id}`}
                              placeholder="Stock"
                              value={branch.stock}
                            step={formData.allows_decimal_stock ? "0.01" : "1"}
                            onChange={(e) => {
                              const updated = [...formData.branches];
                              updated[idx].stock =
                                e.target.value === "" ? "" : Number(e.target.value);
                              setFormData({ ...formData, branches: updated });
                            }}
                            className={`border px-3 py-2 rounded w-28 ${
                              getNestedError("branches", idx, "stock")
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          /></div>
                          <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor={`price-${branch.id}`}>Precio</label>
                                   <input
                            type="number"
                            min={0}
                            placeholder="Precio"
                            value={branch.price}
                            step="0.01"
                            onChange={(e) => {
                              const updated = [...formData.branches];
                              updated[idx].price =
                                e.target.value === ""
                                  ? ""
                                  : Number.parseFloat(e.target.value);
                              setFormData({ ...formData, branches: updated });
                            }}
                            className={`border px-3 py-2 rounded w-32 ${
                              getNestedError("branches", idx, "price")
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                          </div>
                   
                        </div>

                        {/* Errores por campo del pivote */}
                        {getNestedError("branches", idx, "id") && (
                          <p className="text-red-600 text-sm mt-1">
                            {getNestedError("branches", idx, "id")}
                          </p>
                        )}
                        {getNestedError("branches", idx, "stock") && (
                          <p className="text-red-600 text-sm mt-1">
                            {getNestedError("branches", idx, "stock")}
                          </p>
                        )}
                        {getNestedError("branches", idx, "price") && (
                          <p className="text-red-600 text-sm mt-1">
                            {getNestedError("branches", idx, "price")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Descripción (opcional) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError("description")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Descripción del producto..."
                />
                {getFieldError("description") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("description")}
                  </p>
                )}
              </div>
            </div>
          </div>

    

          {/* Configuración de Inventario */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Configuración de Inventario
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock mínimo de alerta (no confundir con pivot) */}
              <div>
                <label
                  htmlFor="min_stock"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Mínimo de Alerta
                </label>
                <input
                  type="number"
                  id="min_stock"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    getFieldError("min_stock")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="10"
                />
                {getFieldError("min_stock") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("min_stock")}
                  </p>
                )}
              </div>

              {/* Flags */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="track_inventory"
                    name="track_inventory"
                    checked={formData.track_inventory}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="track_inventory"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    Seguimiento de Inventario
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="is_published"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    Publicado
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Crear Producto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
