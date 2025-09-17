import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { purchasesAPI, productsAPI, suppliersAPI, paymentMethodsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Select from 'react-select';

const uid = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export default function CreatePurchase() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  // ---------- Estado ----------
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    supplier_id: '',
    payment_method: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    notes: '',
    items: [
      { _id: uid(), product_id: '', quantity: 1, unit_cost: '' },
    ],
  });

  // ---------- Helpers ----------
  const normalize = (res) => res?.data?.data ?? res?.data ?? res ?? [];
  const findProduct = (id) => products.find(p => String(p.id) === String(id));

  const canSubmit = useMemo(() => {
const baseOk = form.supplier_id && form.payment_method && form.purchase_date;
    const itemsOk = form.items.length > 0 && form.items.every(i => i.product_id && i.quantity > 0 && i.unit_cost !== '');
    return Boolean(baseOk && itemsOk && !loadingSubmit);
  }, [form, loadingSubmit]);

  const totalPurchase = useMemo(() => {
    return form.items.reduce((acc, it) => {
      const q = Number(it.quantity) || 0;
      const c = Number(it.unit_cost) || 0;
      return acc + q * c;
    }, 0);
  }, [form.items]);

  // ---------- Carga inicial ----------
  useEffect(() => {
    const load = async () => {
      try {
        const [suppliersRes, productsRes, methodsRes] = await Promise.all([
          suppliersAPI.getActiveSuppliers(),
          productsAPI.getAll(),
          paymentMethodsAPI.getActive(),
        ]);

        const sups = normalize(suppliersRes);
        const prods = normalize(productsRes);
        const methodsRaw = normalize(methodsRes);

        setSuppliers(sups);
        setProducts(prods);
        // Asegura {id,name}
        const methods = methodsRaw.map((m, i) => (
          typeof m === 'string' ? { id: String(i + 1), name: m } : { id: m.id, name: m.name }
        ));
        setPaymentMethods(methods);
      } catch (e) {
        console.error('Error cargando datos iniciales:', e);
        toastError('Error al cargar datos iniciales');
      } finally {
        setLoadingPage(false);
      }
    };
    load();
  }, [toastError]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleItemChange = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(it => it._id === id ? { ...it, [field]: value } : it),
    }));
    const key = `items.${id}.${field}`;
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { _id: uid(), product_id: '', quantity: 1, unit_cost: '' }],
    }));
  };

  const removeItem = (id) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter(it => it._id !== id) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toastError('Completa los campos obligatorios');
      return;
    }

    setLoadingSubmit(true);
    setErrors({});

    try {
      // payload normalizado para backend
 const payload = {
  supplier_id: Number(form.supplier_id),
  payment_method: form.payment_method,
  // el backend pone purchase_date = now(), pero puedes enviarlo si tu FormRequest lo valida:
  purchase_date: form.purchase_date,
  delivery_date: form.expected_delivery || null, // 👈 renombrado
  
  notes: form.notes || null,
  items: form.items.map(it => ({
    product_id: Number(it.product_id),
    quantity: Number(it.quantity),
    purchase_price: Number(it.unit_cost),       // 👈 renombrado
  })),
};
;
console.log('Payload a enviar:', payload);

      await purchasesAPI.create(payload);
      toastSuccess('Compra registrada exitosamente');
      navigate('/purchases');
    } catch (err) {
      console.error('Error al registrar compra:', err);
      const status = err.response?.status;
      if (status === 422 && err.response?.data?.errors) {
        // backend Laravel validation
        setErrors(err.response.data.errors);
        toastError('Corrige los errores del formulario');
      } else {
        const msg = err.response?.data?.message || err.message || 'Error al registrar la compra';
        setErrors({ general: msg });
        toastError(msg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ---------- UI ----------
  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nueva Compra</h1>
          <p className="mt-2 text-gray-600">Registra una nueva compra de productos para tu inventario</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Proveedor */}
              <div>
                <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={e => handleChange(e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.supplier_id ? 'border-red-300' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(s => (
                    <option key={`sup-${s.id ?? s.email ?? s.name}`} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id && <p className="mt-1 text-sm text-red-600">{errors.supplier_id[0]}</p>}
              </div>

              {/* Método de pago */}
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={e => handleChange(e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.payment_method ? 'border-red-300' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Seleccionar método</option>
                  {paymentMethods.map(m => (
                    <option key={`pm-${m.id}`} value={m.name}>{m.name}</option>
                  ))}
                </select>
                {errors.payment_method && <p className="mt-1 text-sm text-red-600">{errors.payment_method[0]}</p>}
              </div>

              {/* Fecha de compra */}
              <div>
                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra *
                </label>
                <input
                  type="date"
                  id="purchase_date"
                  name="purchase_date"
                  value={form.purchase_date}
                  onChange={e => handleChange(e)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.purchase_date ? 'border-red-300' : 'border-gray-300'}`}
                  required
                />
                {errors.purchase_date && <p className="mt-1 text-sm text-red-600">{errors.purchase_date[0]}</p>}
              </div>

              {/* Entrega esperada */}
              <div>
                <label htmlFor="expected_delivery" className="block text-sm font-medium text-gray-700 mb-2">
                  Entrega Esperada
                </label>
                <input
                  type="date"
                  id="expected_delivery"
                  name="expected_delivery"
                  value={form.expected_delivery}
                  onChange={e => handleChange(e)}
                
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.expected_delivery ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.expected_delivery && <p className="mt-1 text-sm text-red-600">{errors.expected_delivery[0]}</p>}
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Productos</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </button>
              </div>

              <div className="space-y-4">
                {form.items.map((item, idx) => (
                  <div key={item._id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-md">
                    {/* Producto */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                  <Select
  options={products.map(p => ({
    value: p.id,
    label: p.name ?? p.title
  }))}
  value={products
    .map(p => ({ value: p.id, label: p.name ?? p.title }))
    .find(opt => String(opt.value) === String(item.product_id)) || null}
  onChange={(selected) =>
    handleItemChange(item._id, 'product_id', selected ? selected.value : '')
  }
  classNamePrefix="react-select"
  placeholder="Seleccionar producto"
  styles={{
    control: (base, state) => ({
      ...base,
      borderColor: errors[`items.${idx}.product_id`] ? 'red' : base.borderColor,
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : base.boxShadow,
      '&:hover': { borderColor: '#2563eb' },
    }),
  }}
/>
{errors[`items.${idx}.product_id`] && (
  <p className="mt-1 text-xs text-red-600">{errors[`items.${idx}.product_id`][0]}</p>
)}

                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item._id, 'quantity', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`items.${idx}.quantity`] ? 'border-red-300' : 'border-gray-300'}`}
                        required
                      />
                      {errors[`items.${idx}.quantity`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`items.${idx}.quantity`][0]}</p>
                      )}
                    </div>

                    {/* Costo unitario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(item._id, 'unit_cost', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[`items.${idx}.unit_cost`] ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="0.00"
                        required
                      />
        
{(errors[`items.${idx}.unit_cost`] || errors[`items.${idx}.purchase_price`]) && (
  <p className="mt-1 text-xs text-red-600">
    {(errors[`items.${idx}.unit_cost`] || errors[`items.${idx}.purchase_price`])[0]}
  </p>
)}

                    </div>

                    {/* Eliminar */}
                    <div className="flex items-end">
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.notes ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Notas adicionales sobre la compra…"
              />
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes[0]}</p>}
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total de la Compra:</span>
                <span className="text-2xl font-bold text-green-600">
                  {totalPurchase.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/purchases')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`px-6 py-2 border border-transparent rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${!canSubmit ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loadingSubmit ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando…
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Registrar Compra
                  </div>
                )}
              </button>
            </div>

            {/* Error general */}
            {errors.general && (
              <div className="text-red-600 text-sm pt-2">{errors.general}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
