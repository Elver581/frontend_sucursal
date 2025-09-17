import { Link, useParams } from "react-router-dom";
import { useBranchAccess } from "../../hooks/useBranhAccess";
import { useEffect, useState } from "react";
import { branchesAPI } from "../../services/api";
import { ShoppingCart, Package, BarChart2, FileText } from "lucide-react";

export default function BranchDashboard() {
  const { branchId } = useParams();
  const { branchId: userBranchId } = useBranchAccess();
  const [branch, setBranch] = useState(null);
  const parsedBranchId = parseInt(branchId, 10);
const parsedUserBranchId = parseInt(userBranchId, 10);

  useEffect(() => {
    if (parsedBranchId === parsedUserBranchId) {
      branchesAPI.getById(branchId)
        .then(res => setBranch(res.data))
      .catch(err => {
        console.error('Error al cargar sucursal:', err);
        setBranch({ error: true });
      });
  }
}, [branchId, userBranchId]);

  if (parseInt(branchId) !== parseInt(userBranchId)) {
    return <div className="text-red-600 font-bold p-8">No tienes acceso a esta sucursal.</div>;
  }

  if (!branch) return <div className="text-center py-10">Cargando sucursal...</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
   <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
  <Package className="w-8 h-8 text-blue-600" />
  {branch.name || 'Sucursal sin nombre'}
</h1>

        <p className="text-gray-500 mt-1">Código: <span className="font-mono">{branch.code}</span> | Dirección: {branch.address}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          icon={<ShoppingCart className="w-8 h-8 text-green-600" />}
          title="Ventas"
          description="Gestiona y consulta las ventas de esta sucursal."
          to={`/sales/${branchId}`}
        />
        <DashboardCard
          icon={<Package className="w-8 h-8 text-yellow-600" />}
          title="Compras"
          description="Registra y revisa las compras realizadas."
          to={`/sucursales/${branchId}/compras`}
        />
        <DashboardCard
          icon={<BarChart2 className="w-8 h-8 text-purple-600" />}
          title="Inventario"
          description="Controla el stock y movimientos de productos."
          to={`/sucursales/${branchId}/inventario`}
        />
        <DashboardCard
          icon={<FileText className="w-8 h-8 text-blue-400" />}
          title="Reportes"
          description="Visualiza reportes y estadísticas de la sucursal."
          to={`/sucursales/${branchId}/reportes`}
        />
      </div>

      {/* Aquí puedes agregar widgets, KPIs o gráficos rápidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Ventas hoy" value="$0" />
          <KpiCard label="Productos en stock" value="0" />
          <KpiCard label="Compras mes" value="$0" />
          <KpiCard label="Alertas de stock" value="0" />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, description, to }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col gap-2 border border-gray-100 hover:border-blue-200"
    >
      <div>{icon}</div>
      <div className="font-bold text-lg">{title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </Link>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
      <div className="text-2xl font-bold text-blue-700">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}