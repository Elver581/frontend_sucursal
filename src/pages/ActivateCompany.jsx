import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, XCircle, Loader2, Building, Mail } from 'lucide-react';
import api from '../services/api';

const ActivateCompany = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const checkTokenInfo = useCallback(async () => {
    try {
      const response = await api.get('/activation/token-info', {
        params: { token }
      });
      setTokenInfo(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al verificar el token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkTokenInfo();
    } else {
      setError('Token de activación no válido');
      setLoading(false);
    }
  }, [token, checkTokenInfo]);

  const handleActivation = async () => {
    setActivating(true);
    try {
      await api.post('/activation/activate-company', { token });
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: '¡Empresa activada exitosamente! Ya puedes iniciar sesión.',
            type: 'success'
          }
        });
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al activar la empresa');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando token</h2>
            <p className="text-gray-600 text-center">
              Por favor espera mientras verificamos tu token de activación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Empresa Activada!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu empresa ha sido activada exitosamente. Serás redirigido al login en unos segundos...
            </p>
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirigiendo...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error de Activación
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3 w-full">
              <button
                onClick={() => navigate('/company-register')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrar Nueva Empresa
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ir al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Activar Empresa
          </h1>
          
          {tokenInfo && (
            <div className="w-full mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {tokenInfo.company.name}
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {tokenInfo.company.email}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Token válido hasta: {tokenInfo.expires_at}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Haz clic en el botón para activar tu empresa y comenzar a utilizar todas las funcionalidades de VentaPro.
          </p>

          <button
            onClick={handleActivation}
            disabled={activating}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {activating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Activar Empresa
              </>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Si tienes problemas con la activación, contacta con nuestro equipo de soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateCompany;
