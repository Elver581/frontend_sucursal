import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Users,
  BarChart3,
  CheckCircle,
  Star,
  Shield,
  Zap,
  Globe,
  Target,
  Award,
  ArrowRight,
  PlayCircle,
  Code,
  Wrench,
  Layers,
  Server,
  Smartphone,
  Cloud
} from 'lucide-react';

const Landing = () => {
  const [view, setView] = useState('plataforma'); // 'plataforma' | 'servicios'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section (SaaS protagonista) */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-blue-100 bg-opacity-20 backdrop-blur-sm text-blue-100 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-blue-300 border-opacity-30">
              <Award className="h-4 w-4 mr-2 text-amber-100" />
              #1 Plataforma de Gestión Empresarial en Colombia
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Revoluciona Tu
              <span className="block text-gradient bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Gestión Empresarial
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transforma tu negocio con nuestra plataforma integral de gestión. 
              <span className="font-semibold text-white"> Inventario, ventas, compras y analytics</span> 
              en un solo lugar, diseñado para el éxito empresarial.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                to="company-register"
                className="group bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 flex items-center space-x-3"
              >
                <Zap className="h-6 w-6" />
                <span>Comenzar Gratis</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/login"
                className="group bg-white bg-opacity-10 backdrop-blur-sm text-white px-10 py-4 rounded-xl text-lg font-semibold border-2 border-white border-opacity-30 hover:bg-opacity-20 transition-all duration-300 flex items-center space-x-3"
              >
                <PlayCircle className="h-6 w-6" />
                <span>Ver Demo</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">10K+</div>
                <div className="text-blue-200">Empresas Activas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">$2.5M</div>
                <div className="text-blue-200">Ventas Procesadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-blue-200">Tiempo Activo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-blue-200">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selector Plataforma vs Servicios */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl">
            <div className="bg-slate-100 p-2 rounded-2xl flex">
              <button
                onClick={() => setView('plataforma')}
                className={`w-1/2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  view === 'plataforma'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Plataforma (SaaS)
              </button>
              <button
                onClick={() => setView('servicios')}
                className={`w-1/2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  view === 'servicios'
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Servicios de Desarrollo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section (sin cambios principales) */}
      <section className="py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600 to-transparent opacity-30"></div>
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center bg-purple-100 bg-opacity-20 backdrop-blur-sm text-purple-100 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-purple-300 border-opacity-30">
                  <Shield className="h-4 w-4 mr-2" />
                  Solución SaaS Multi-Empresa
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  ¿Tienes una 
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Empresa?
                  </span>
                </h2>
                
                <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                  Únete a nuestra plataforma SaaS diseñada para 
                  <span className="font-semibold text-white"> digitalizar y optimizar </span>
                  tus procesos de negocio.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Multi-sucursal con gestión centralizada</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>30 días completamente gratis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Activación profesional y soporte dedicado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Datos seguros y respaldados en la nube</span>
                  </div>
                </div>

                <Link
                  to="/company-register"
                  className="group inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-8 py-4 rounded-xl text-lg font-bold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105"
                >
                  <Users className="h-6 w-6 mr-3" />
                  Registrar Mi Empresa
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="lg:text-right">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl border border-white border-opacity-20">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                    <div className="text-purple-100 text-sm">Empresas Registradas</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl border border-white border-opacity-20">
                    <div className="text-3xl font-bold text-green-400 mb-2">15</div>
                    <div className="text-purple-100 text-sm">Módulos Integrados</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl border border-white border-opacity-20">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">99%</div>
                    <div className="text-purple-100 text-sm">Satisfacción Cliente</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-2xl border border-white border-opacity-20">
                    <div className="text-3xl font-bold text-purple-400 mb-2">30</div>
                    <div className="text-purple-100 text-sm">Días Gratis</div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                  <h4 className="font-bold text-white mb-2">¡Oferta Especial!</h4>
                  <p className="text-green-100 text-sm">
                    Primeros 100 registros obtienen 60 días gratis + Setup personalizado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Servicios de Desarrollo (nueva) */}
      <section className={`py-24 transition-opacity ${view === 'servicios' ? 'opacity-100' : 'opacity-100'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Code className="h-4 w-4 mr-2" />
              Servicios de Desarrollo de Software
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Construimos soluciones a la medida de tu operación
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Integraciones, APIs, apps y automatizaciones que se conectan con tu plataforma para acelerar resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-slate-50 to-indigo-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-6">
                <Layers className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sistemas Web & APIs</h3>
              <p className="text-slate-600 mb-6">Backends en Laravel/Node y frontends en React/Tailwind; APIs REST/GraphQL escalables.</p>
              <Link to="/services" className="text-indigo-700 font-semibold inline-flex items-center">
                Ver detalle <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-slate-50 to-green-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center mb-6">
                <Server className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Integraciones & ERP</h3>
              <p className="text-slate-600 mb-6">Conectamos tu SaaS con Siigo, facturación, pasarelas, logística, BI y más.</p>
              <Link to="/services#integraciones" className="text-green-700 font-semibold inline-flex items-center">
                Ver casos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-slate-50 to-amber-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center mb-6">
                <Smartphone className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Apps & Flujos Operativos</h3>
              <p className="text-slate-600 mb-6">Aplicaciones móviles/web para campo, despachos, PQR y soporte al cliente.</p>
              <Link to="/services#apps" className="text-amber-700 font-semibold inline-flex items-center">
                Ver módulos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-slate-50 to-cyan-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-cyan-600 flex items-center justify-center mb-6">
                <Cloud className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automatización & Bots</h3>
              <p className="text-slate-600 mb-6">Workflows con WhatsApp/API Meta, cronjobs, orquestación y notificaciones.</p>
              <Link to="/services#automation" className="text-cyan-700 font-semibold inline-flex items-center">
                Ver flujos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-slate-50 to-rose-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-rose-600 flex items-center justify-center mb-6">
                <Wrench className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Soporte & Evolutivos</h3>
              <p className="text-slate-600 mb-6">Mantenimiento, mejoras continuas, SLO/SLAs y roadmap técnico trimestral.</p>
              <Link to="/services#soporte" className="text-rose-700 font-semibold inline-flex items-center">
                Ver planes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-slate-50 to-fuchsia-50 p-8 rounded-2xl hover:shadow-2xl transition-all">
              <div className="w-14 h-14 rounded-xl bg-fuchsia-600 flex items-center justify-center mb-6">
                <BarChart3 className="text-white h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Data & Analytics</h3>
              <p className="text-slate-600 mb-6">KPIs, dashboards, ETL y gobierno de datos alineado a tus procesos.</p>
              <Link to="/services#data" className="text-fuchsia-700 font-semibold inline-flex items-center">
                Ver dashboards <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Bloque credibilidad rápida */}
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Tiempo promedio de entrega</p>
              <p className="text-3xl font-bold">2–6 semanas</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Índice de éxito</p>
              <p className="text-3xl font-bold">98%</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">Alineación SGI/ISO</p>
              <p className="text-3xl font-bold">Sí</p>
            </div>
          </div>

          {/* CTA Servicios */}
          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-blue-800 transition-all shadow-lg"
            >
              Agendar Consultoría <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section (SaaS) */}
      <section className={`py-24 bg-white ${view === 'plataforma' ? '' : ''}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Todo lo que necesitas para hacer crecer tu negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas poderosas y fáciles de usar, diseñadas para empresarios como tú
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Inventario</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Control total de tu inventario con alertas de stock bajo, seguimiento en tiempo real y optimización automática.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-2xl w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Control de Ventas</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Registra ventas, gestiona clientes y analiza tu rendimiento con reportes detallados y insights accionables.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                <span>Explorar funciones</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-purple-50 to-indigo-100 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 rounded-2xl w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Avanzados</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Obtén insights valiosos con reportes en tiempo real, gráficos interactivos y métricas de rendimiento.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                <span>Explorar funciones</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section (SaaS) */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Más que una herramienta, somos tu socio estratégico para el crecimiento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Shield className="h-12 w-12 text-blue-400 mb-6" />
              <h3 className="text-xl text-blue-400 mb-4">Seguridad Enterprise</h3>
              <p className="text-blue-300">Cifrado de nivel bancario y respaldos automáticos para proteger tu información</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Zap className="h-12 w-12 text-yellow-400 mb-6" />
              <h3 className="text-xl text-yellow-400 mb-4">Súper Rápido</h3>
              <p className="text-blue-300">Interfaz optimizada para máxima velocidad y eficiencia en tus operaciones</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Globe className="h-12 w-12 text-green-400 mb-6" />
              <h3 className="text-xl text-green-400 mb-4">Multi-dispositivo</h3>
              <p className="text-blue-300">Accede desde cualquier dispositivo, en cualquier lugar, siempre sincronizado</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Users className="h-12 w-12 text-purple-400 mb-6" />
              <h3 className="text-xl text-purple-400 mb-4">Equipo Colaborativo</h3>
              <p className="text-blue-300">Gestiona permisos de usuario y trabaja en equipo de forma eficiente</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Target className="h-12 w-12 text-red-400 mb-6" />
              <h3 className="text-xl text-red-400 mb-4">Personalizable</h3>
              <p className="text-blue-300">Adapta la plataforma a las necesidades específicas de tu negocio</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border border-white border-opacity-20">
              <Star className="h-12 w-12 text-orange-400 mb-6" />
              <h3 className="text-xl text-orange-400 mb-4">Soporte Premium</h3>
              <p className="text-blue-300">Atención personalizada 24/7 con expertos en gestión empresarial</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final con doble objetivo */}
      <section className="py-24 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-white mb-12 max-w-2xl mx-auto opacity-90">
            Únete a miles de empresarios que ya están creciendo con nuestra plataforma o agenda una consultoría para una solución a medida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/company-register"
              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-10 py-4 rounded-xl text-lg font-bold hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <Users className="h-6 w-6" />
              <span>Probar Plataforma</span>
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 border border-white/30 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <Code className="h-6 w-6" />
              <span>Agendar Consultoría</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
