import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Mail, 
  Clock, 
  Building2, 
  ArrowRight,
  Home,
  User,
  MessageSquare
} from 'lucide-react';

const CompanyRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyName, adminEmail, estimatedActivationTime } = location.state || {};

  // Si no hay datos del estado, redirigir al home
  React.useEffect(() => {
    if (!companyName || !adminEmail) {
      navigate('/', { replace: true });
    }
  }, [companyName, adminEmail, navigate]);

  if (!companyName || !adminEmail) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full animate-bounce delay-500"></div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Bienvenida <span className="font-semibold text-green-600">{companyName}</span>
          </p>
          <p className="text-gray-500">
            Tu solicitud de registro empresarial ha sido enviada correctamente
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Status Information */}
            <div className="space-y-6 mb-8">
              {/* Email Confirmation */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Correo de Confirmación Enviado</h3>
                  <p className="text-gray-600 text-sm">
                    Hemos enviado un correo de confirmación a{' '}
                    <span className="font-medium text-blue-600">{adminEmail}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Revisa también tu carpeta de spam o correo no deseado
                  </p>
                </div>
              </div>

              {/* Activation Timeline */}
              <div className="flex items-start space-x-4 p-4 bg-amber-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">En Proceso de Revisión</h3>
                  <p className="text-gray-600 text-sm">
                    Nuestro equipo revisará tu solicitud y la activará pronto
                  </p>
                  <p className="text-amber-700 text-sm font-medium mt-1">
                    Tiempo estimado: {estimatedActivationTime || '24-48 horas laborales'}
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Building2 className="w-6 h-6 text-green-600 mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">30 Días Gratis Te Esperan</h3>
                  <p className="text-gray-600 text-sm">
                    Una vez activada tu cuenta, tendrás acceso completo por 30 días sin costo
                  </p>
                  <p className="text-green-700 text-sm font-medium mt-1">
                    ¡Sin compromiso de permanencia!
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Qué sigue ahora?</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-gray-600">Recibirás un email de confirmación en unos minutos</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-gray-600">Nuestro equipo revisará y activará tu cuenta</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-gray-600">Te notificaremos cuando puedas iniciar sesión</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">4</span>
                  </div>
                  <p className="text-gray-600">¡Comienza a gestionar tu empresa!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
              
              <Link
                to="/login"
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Ir al Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                ¿Necesitas ayuda o tienes preguntas?
              </p>
              <a
                href="mailto:soporte@tuempresa.com"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Contáctanos por email
              </a>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">¿Por qué necesitamos activación manual?</h4>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Revisamos cada registro para garantizar la seguridad y calidad de nuestra plataforma. 
              Esto nos permite ofrecerte el mejor servicio desde el primer día.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationSuccess;
