import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { 
  LogOut, 
  User, 
  Home, 
  Plus, 
  ShoppingBag, 
  TrendingUp,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Package,
  Tag,
  Building,
  Shield,
  Users,
  Settings,
  MoreHorizontal,
  Code
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = isAuthenticated ? [
    // Super Admin options
    ...(user?.role === 'super_admin' ? [
      {
        label: 'Admin Dashboard',
        path: '/admin',
        icon: Shield,
        description: 'Panel de administración'
      },
      {
        label: 'Empresas',
        path: '/admin/companies',
        icon: Building,
        description: 'Gestionar empresas'
      },
      {
        label: 'Usuarios',
        path: '/admin/users',
        icon: Users,
        description: 'Gestionar usuarios'
      }
    ] : [
      // Regular user options
      {
        label: 'Dashboard',
        path: '/',
        icon: Home,
        description: 'Panel principal'
      },
      {
        label: 'Productos',
        path: '/dashboard',
        icon: Package,
        description: 'Gestionar inventario'
      },
      {
        label: 'Categorías',
        path: '/categories',
        icon: Tag,
        description: 'Gestionar categorías'
      },
      {
        label: 'Ventas',
        path: '/sales',
        icon: TrendingUp,
        description: 'Registrar y ver ventas'
      },
      {
        label: 'Compras',
        path: '/purchases',
        icon: ShoppingCart,
        description: 'Gestionar compras'
      },
      {
        label: 'Proveedores',
        path: '/suppliers',
        icon: Building,
        description: 'Gestionar proveedores'
      },
      {
        label: 'Inventario',
        path: '/inventory',
        icon: Package,
        description: 'Control de stock'
      },
      {
        label: 'Reportes',
        path: '/stats',
        icon: BarChart3,
        description: 'Estadísticas y análisis'
      },
      {
        label: 'Dashboard Empresarial',
        path: '/company-dashboard',
        icon: BarChart3,
        description: 'Dashboard de la empresa'
      },
      {
        label: 'Gestión Productos',
        path: '/products-manager',
        icon: Package,
        description: 'Administrar productos'
      },
      {
        label: 'Pagos',
        path: '/payments',
        icon: CreditCard,
        description: 'Métodos de pago'
      }
    ]),
    // Company profile for company users
    ...(user?.role !== 'super_admin' && user?.company_id ? [
      {
        label: 'Perfil Empresa',
        path: '/company-profile',
        icon: Settings,
        description: 'Configurar empresa'
      },
      {
        label: 'Sucursales',
        path: '/branches',
        icon: Building,
        description: 'Gestionar sucursales'
      },
      {
        label: 'Traslados',
        path: '/branch-transfers',
        icon: Package,
        description: 'Traslados entre sucursales'
      },
      {
        label: 'Usuarios Empresa',
        path: '/company-users',
        icon: Users,
        description: 'Gestionar usuarios'
      }
    ] : [])
  ] : [
    {
      label: 'Inicio',
      path: '/',
      icon: Home,
      description: 'Página principal'
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50" style={{ zIndex: 50 }}>
      <div className="max-w-full px-4">
        <div className="flex justify-between items-center py-3 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
   <div className="bg-gradient-to-r from-amber-500 to-orange-700 p-1.5 rounded-lg shadow-lg">
  <BarChart3 className="h-5 w-5 text-white" />
</div>
<div>
  <span className="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-orange-700 bg-clip-text text-transparent">
    ETS Technology
  </span>
  <p className="text-xs text-gray-500 hidden sm:block font-medium leading-tight">
    Servicios de Desarrollo de Software
  </p>
</div>


          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {/* Mostrar primeros 6 elementos */}
              {navItems.slice(0, 6).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  title={item.description}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              ))}
              
              {/* Botón "Más" - Versión portal para evitar problemas de z-index */}
              {navItems.length > 6 && (
                <>
                  <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isMoreMenuOpen 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    type="button"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">Más ({navItems.slice(6).length})</span>
                  </button>

                  {/* Modal/Overlay para el dropdown */}
                  {isMoreMenuOpen && (
                    <div 
                      className="fixed inset-0 z-[99999]" 
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      {/* Dropdown posicionado de forma fija */}
                      <div 
                        className="absolute top-16 right-4 w-72 bg-white rounded-lg shadow-2xl border border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-1">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-t-lg border-b border-gray-200">
                            📋 Más opciones ({navItems.slice(6).length})
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {navItems.slice(6).map((item, index) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMoreMenuOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-3 text-sm hover:bg-blue-50 transition-colors ${
                                  isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600'
                                } ${index === navItems.slice(6).length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'}`}
                              >
                                <div className={`p-2 rounded-lg ${
                                  isActive(item.path) ? 'bg-blue-200' : 'bg-gray-200'
                                }`}>
                                  <item.icon className={`h-4 w-4 ${
                                    isActive(item.path) ? 'text-blue-700' : 'text-gray-600'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold">{item.label}</div>
                                  <div className="text-xs text-gray-500">{item.description}</div>
                                </div>
                                {isActive(item.path) && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {/* Sell Button */}
                <Link
                  to="/create-product"
                  className="hidden md:flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Vender</span>
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-medium text-gray-900 leading-tight">{user?.name}</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {user?.role === 'super_admin' ? 'Super Admin' : 
                       user?.role === 'company_admin' ? 'Admin' :
                       user?.role === 'manager' ? 'Gerente' : 'Empleado'}
                    </p>
                  </div>
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors p-1.5"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/company-register"
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors text-xs border border-purple-200 hover:border-purple-300 px-2 py-1 rounded-lg"
                >
                  Empresa
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-xs"
                >
                  Ingresar
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                </Link>
              ))}
              
              {isAuthenticated && (
                <Link
                  to="/create-product"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-md font-medium mt-4"
                >
                  <Plus className="h-5 w-5" />
                  <span>Vender Producto</span>
                </Link>
              )}

              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/company-register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-md font-medium transition-colors"
                  >
                    <Building className="h-5 w-5" />
                    <span>Registro Empresarial</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-md font-medium transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Registrarse</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
