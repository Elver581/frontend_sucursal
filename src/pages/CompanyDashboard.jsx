import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPackage, FiBarChart, FiUsers } from 'react-icons/fi';
import Swal from 'sweetalert2';

const CompanyDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [period, setPeriod] = useState('today');
    const [showCashFlowForm, setShowCashFlowForm] = useState(false);
    
    // Estados para los formularios
    const [cashFlowForm, setCashFlowForm] = useState({
        type: 'income',
        amount: '',
        reason: '',
        description: '',
        category: 'other',
        branch_id: '',
        reference: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, [selectedBranch]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = selectedBranch ? `?branch_id=${selectedBranch}` : '';
            
            const response = await fetch(`http://localhost:8001/api/company/dashboard${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setDashboardData(result.data);
            } else {
                throw new Error('Error al cargar datos');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCashFlowSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://localhost:8001/api/company/cash-flow', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cashFlowForm)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: result.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                setShowCashFlowForm(false);
                setCashFlowForm({
                    type: 'income',
                    amount: '',
                    reason: '',
                    description: '',
                    category: 'other',
                    branch_id: '',
                    reference: ''
                });
                fetchDashboardData();
            } else {
                throw new Error(result.message || 'Error al crear transacción');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const fetchSalesByPaymentMethod = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (selectedBranch) params.append('branch_id', selectedBranch);
            params.append('period', period);
            
            const response = await fetch(`http://localhost:8001/api/company/sales-by-payment-method?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                // Mostrar reporte de ventas por método de pago
                let tableRows = result.data.summary.map(item => 
                    `<tr>
                        <td>${item.method}</td>
                        <td>${item.total_sales}</td>
                        <td>$${item.total_amount.toFixed(2)}</td>
                        <td>$${item.average_sale}</td>
                    </tr>`
                ).join('');

                await Swal.fire({
                    title: `Ventas por Método de Pago - ${period}`,
                    html: `
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f3f4f6;">
                                    <th style="padding: 10px; text-align: left;">Método</th>
                                    <th style="padding: 10px; text-align: left;">Ventas</th>
                                    <th style="padding: 10px; text-align: left;">Total</th>
                                    <th style="padding: 10px; text-align: left;">Promedio</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                        <div style="margin-top: 15px; padding: 15px; background: #e5e7eb; border-radius: 5px;">
                            <strong>Total General: ${result.data.total_sales} ventas - $${result.data.total_amount.toFixed(2)}</strong>
                        </div>
                    `,
                    width: '800px'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar el reporte de ventas', 'error');
        }
    };

    const fetchCashFlowReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (selectedBranch) params.append('branch_id', selectedBranch);
            params.append('period', period);
            
            const response = await fetch(`http://localhost:8001/api/company/cash-flow-report?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const data = result.data;
                
                await Swal.fire({
                    title: `Reporte de Flujo de Caja - ${period}`,
                    html: `
                        <div style="text-align: left;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                                <div style="background: #dcfce7; padding: 15px; border-radius: 5px; flex: 1; margin-right: 10px;">
                                    <h4 style="color: #166534; margin: 0;">Ingresos</h4>
                                    <p style="font-size: 24px; font-weight: bold; color: #166534; margin: 5px 0;">$${data.total_income.toFixed(2)}</p>
                                </div>
                                <div style="background: #fef2f2; padding: 15px; border-radius: 5px; flex: 1; margin-left: 10px;">
                                    <h4 style="color: #dc2626; margin: 0;">Gastos</h4>
                                    <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 5px 0;">$${data.total_expenses.toFixed(2)}</p>
                                </div>
                            </div>
                            <div style="background: ${data.net_flow >= 0 ? '#dcfce7' : '#fef2f2'}; padding: 15px; border-radius: 5px; text-align: center;">
                                <h4 style="color: ${data.net_flow >= 0 ? '#166534' : '#dc2626'}; margin: 0;">Flujo Neto</h4>
                                <p style="font-size: 32px; font-weight: bold; color: ${data.net_flow >= 0 ? '#166534' : '#dc2626'}; margin: 10px 0;">$${data.net_flow.toFixed(2)}</p>
                            </div>
                        </div>
                    `,
                    width: '600px'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo cargar el reporte de flujo de caja', 'error');
        }
    };

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
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Empresarial</h1>
                <div className="flex gap-4">
                    {dashboardData?.branches_summary && dashboardData.branches_summary.length > 0 && (
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas las sucursales</option>
                            {dashboardData.branches_summary.map(branch => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => setShowCashFlowForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Registrar Transacción
                    </button>
                </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Ventas Hoy</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${dashboardData?.sales_summary?.today?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {dashboardData?.sales_summary?.count_today || 0} ventas
                            </p>
                        </div>
                        <FiDollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Ingresos Mes</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ${dashboardData?.cash_flow_summary?.income_month?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500">Flujo de caja</p>
                        </div>
                        <FiTrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Productos Activos</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {dashboardData?.inventory_summary?.active_products || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                                {dashboardData?.inventory_summary?.low_stock || 0} stock bajo
                            </p>
                        </div>
                        <FiPackage className="h-8 w-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Flujo Neto</p>
                            <p className={`text-2xl font-bold ${dashboardData?.cash_flow_summary?.net_month >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${dashboardData?.cash_flow_summary?.net_month?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500">Este mes</p>
                        </div>
                        {dashboardData?.cash_flow_summary?.net_month >= 0 ? (
                            <FiTrendingUp className="h-8 w-8 text-green-600" />
                        ) : (
                            <FiTrendingDown className="h-8 w-8 text-red-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* Botones de reportes */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Reportes</h2>
                <div className="flex gap-4 items-center mb-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Hoy</option>
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mes</option>
                        <option value="year">Este Año</option>
                    </select>
                    <button
                        onClick={fetchSalesByPaymentMethod}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiBarChart className="inline mr-2" />
                        Ventas por Método de Pago
                    </button>
                    <button
                        onClick={fetchCashFlowReport}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiTrendingUp className="inline mr-2" />
                        Reporte Flujo de Caja
                    </button>
                </div>
            </div>

            {/* Productos más vendidos */}
            {dashboardData?.top_products && dashboardData.top_products.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendidos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.top_products.map((product, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.total_sold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${product.revenue}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal para registro de transacciones */}
            {showCashFlowForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-xl font-semibold mb-4">Registrar Transacción</h2>
                        <form onSubmit={handleCashFlowSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                <select
                                    value={cashFlowForm.type}
                                    onChange={(e) => setCashFlowForm({...cashFlowForm, type: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="income">Ingreso</option>
                                    <option value="expense">Gasto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={cashFlowForm.amount}
                                    onChange={(e) => setCashFlowForm({...cashFlowForm, amount: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Motivo</label>
                                <input
                                    type="text"
                                    value={cashFlowForm.reason}
                                    onChange={(e) => setCashFlowForm({...cashFlowForm, reason: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <select
                                    value={cashFlowForm.category}
                                    onChange={(e) => setCashFlowForm({...cashFlowForm, category: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="sales">Ventas</option>
                                    <option value="purchase">Compras</option>
                                    <option value="expense">Gastos</option>
                                    <option value="adjustment">Ajustes</option>
                                    <option value="other">Otros</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
                                <textarea
                                    value={cashFlowForm.description}
                                    onChange={(e) => setCashFlowForm({...cashFlowForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            {dashboardData?.branches_summary && dashboardData.branches_summary.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sucursal (opcional)</label>
                                    <select
                                        value={cashFlowForm.branch_id}
                                        onChange={(e) => setCashFlowForm({...cashFlowForm, branch_id: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccionar sucursal</option>
                                        {dashboardData.branches_summary.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCashFlowForm(false)}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Registrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;
