import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { companiesAPI } from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  ArrowRight,
  Building,
  Users,
  Shield
} from 'lucide-react';

// --------- Helpers de validación/normalización ----------
const normalizeRut = (rut) => rut.replace(/[.\s]/g, '').toUpperCase(); // ej: 900123456-7
const normalizePhone = (p) => p.replace(/\s+/g, '');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isRutBasic = (v) => /^[0-9]{6,10}-[0-9Kk]{1}$/.test(normalizeRut(v));
const isColPhone = (v) => /^(\+57\s?)?[0-9]{10}$/.test(normalizePhone(v));

const sanitizePayload = (data) => ({
  ...data,
  company_rut: normalizeRut(data.company_rut),
  company_phone: normalizePhone(data.company_phone),
  admin_phone: data.admin_phone ? normalizePhone(data.admin_phone) : '',
  company_email: data.company_email.trim(),
  admin_email: data.admin_email.trim(),
  company_name: data.company_name.trim(),
  admin_name: data.admin_name.trim(),
});

const industries = [
  { value: 'retail', label: 'Comercio / Retail' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'services', label: 'Servicios' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'food', label: 'Alimentos y Bebidas' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'real_estate', label: 'Bienes Raíces' },
  { value: 'other', label: 'Otro' },
];

const colombianCities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 
  'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Cucuta',
  'Villavicencio', 'Manizales', 'Neiva', 'Pasto', 'Armenia'
];

const CompanyRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Empresa
    company_name: '',
    company_rut: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_city: '',
    company_industry: '',
    company_description: '',
    // Admin
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_password_confirmation: '',
    admin_phone: '',
    // Términos
    terms_accepted: false,
    privacy_policy_accepted: false,
  });

  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  // --------- Manejo de cambios + limpieza de errores por campo ----------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // --------- Valida por paso antes de avanzar ----------
  const requireFields = (fields) => fields.every((f) => !!formData[f]);

  const nextStep = () => {
    const step1 = ['company_name','company_rut','company_email','company_phone'];
    const step2 = ['company_address','company_city','company_industry'];
    const step3 = ['admin_name','admin_email','admin_password','admin_password_confirmation'];

    const map = {1: step1, 2: step2, 3: step3};
    const fields = map[step] ?? [];

    if (!requireFields(fields)) {
      showError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (step === 1) {
      if (!isRutBasic(formData.company_rut)) return showError('RUT inválido. Ejemplo: 900123456-7');
      if (!isEmail(formData.company_email)) return showError('Email empresarial inválido');
      if (!isColPhone(formData.company_phone)) return showError('Teléfono empresarial inválido (Colombia).');
    }
    if (step === 3) {
      if (!isEmail(formData.admin_email)) return showError('Email personal inválido');
      if (formData.admin_password !== formData.admin_password_confirmation) {
        return showError('Las contraseñas no coinciden');
      }
      // Reglas del backend: 8+, mayus/minus, números y símbolos
      const strong = {
        len8: formData.admin_password.length >= 8,
        upper: /[A-Z]/.test(formData.admin_password),
        lower: /[a-z]/.test(formData.admin_password),
        num: /[0-9]/.test(formData.admin_password),
        sym: /[^A-Za-z0-9]/.test(formData.admin_password),
      };
      if (!(strong.len8 && strong.upper && strong.lower && strong.num && strong.sym)) {
        return showError('La contraseña debe tener 8+ caracteres, mayúsculas, minúsculas, números y símbolos.');
      }
    }

    // Limpiar errores antes de avanzar
    setErrors({});
    
    // Delay para evitar problemas de renderizado
    setTimeout(() => {
      setStep(step + 1);
    }, 10);
  };

  const prevStep = () => {
    setErrors({});
    setTimeout(() => {
      setStep(Math.max(step - 1, 1));
    }, 10);
  };

  // --------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrors({});

    try {
      const payload = sanitizePayload(formData);
      const response = await companiesAPI.register(payload);

      if (response.data?.success) {
        showSuccess(response.data.message);
        navigate('/company-registration-success', { 
          state: { 
            companyName: response.data.data.company_name,
            adminEmail: response.data.data.admin_email,
            estimatedActivationTime: response.data.data.estimated_activation_time 
          } 
        });
      } else {
        showError('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const beErrors = error.response.data.errors;
        console.log('Errores de validación:', beErrors);
        setErrors(beErrors);

        // Salto al paso donde está el primer error
        const fieldsByStep = {
          1: ['company_name','company_rut','company_email','company_phone'],
          2: ['company_address','company_city','company_industry','company_description'],
          3: ['admin_name','admin_email','admin_password','admin_password_confirmation','admin_phone'],
          4: ['terms_accepted','privacy_policy_accepted'],
        };
        const firstField = Object.keys(beErrors)[0];
        const stepWithError = Number(
          Object.entries(fieldsByStep).find(([, fields]) => fields.includes(firstField))?.[0] ?? step
        );
        console.log('Primer campo con error:', firstField, 'Paso objetivo:', stepWithError);
        if (stepWithError !== step) {
          setTimeout(() => {
            setStep(stepWithError);
          }, 100);
        }

        showError(`Se encontraron ${Object.keys(beErrors).length} errores. Revisa los campos marcados en rojo.`);
      } else {
        const message = error.response?.data?.message || 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        showError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------- Scroll al primer error visible ----------
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return;
    
    // Delay para asegurar que el DOM se haya actualizado
    const timer = setTimeout(() => {
      const first = Object.keys(errors)[0];
      const el = formRef.current?.querySelector(`[name="${first}"]`);
      if (el && typeof el.scrollIntoView === 'function') {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
          console.warn('Error en scroll:', error);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [errors]);

  // --------- Errores helpers ----------
  const getFieldError = (fieldName) => {
    if (!errors[fieldName]) return null;
    return Array.isArray(errors[fieldName]) ? errors[fieldName] : [errors[fieldName]];
  };
  
  const getFieldClasses = (fieldName, baseClasses = "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent") => {
    const hasError = errors[fieldName];
    if (hasError) {
      return baseClasses.replace('border-gray-300', 'border-red-300 bg-red-50')
                      .replace('focus:ring-blue-500', 'focus:ring-red-500');
    }
    return baseClasses.includes('border-gray-300') 
      ? baseClasses 
      : baseClasses + " border-gray-300";
  };

  const renderFieldErrors = (fieldName) => {
    const fieldErrors = getFieldError(fieldName);
    if (!fieldErrors || fieldErrors.length === 0) return null;
    return (
      <div className="mt-1">
        {fieldErrors.map((error, index) => (
          <p key={`${fieldName}-error-${index}`} className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded border-l-2 border-red-500">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {error}
          </p>
        ))}
      </div>
    );
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          } font-semibold`}>
            {step > num ? <CheckCircle className="w-6 h-6" /> : num}
          </div>
          {num < 4 && (
            <div className={`w-16 h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Registro Empresarial
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Únete a nuestra plataforma SaaS y transforma la gestión de tu empresa. 
              <span className="font-semibold text-blue-600"> 30 días gratis</span> para empezar.
            </p>
          </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">30 días gratis</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">Multi-sucursal</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Datos seguros</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {renderStepIndicator()}

          <form ref={formRef} onSubmit={handleSubmit} className="p-8">
            {/* Step 1 */}
            {step === 1 && (
              <div key="step-1" className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Información de la Empresa</h2>
                  <p className="text-gray-600">Datos básicos de identificación empresarial</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Empresa *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Mi Empresa SAS"
                        className={getFieldClasses('company_name')}
                      />
                    </div>
                    {renderFieldErrors('company_name')}
                  </div>

                  {/* RUT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RUT Empresarial *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="company_rut"
                        value={formData.company_rut}
                        onChange={handleChange}
                        placeholder="900123456-7"
                        className={getFieldClasses('company_rut')}
                      />
                    </div>
                    {renderFieldErrors('company_rut')}
                  </div>

                  {/* Email empresarial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Empresarial *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="company_email"
                        value={formData.company_email}
                        onChange={handleChange}
                        placeholder="contacto@miempresa.com"
                        className={getFieldClasses('company_email')}
                      />
                    </div>
                    {renderFieldErrors('company_email')}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono Empresarial *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="company_phone"
                        value={formData.company_phone}
                        onChange={handleChange}
                        placeholder="+57 300 123 4567"
                        className={getFieldClasses('company_phone')}
                      />
                    </div>
                    {renderFieldErrors('company_phone')}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div key="step-2" className="space-y-6">
                <div className="text-center mb-6">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Ubicación y Sector</h2>
                  <p className="text-gray-600">Información comercial y de ubicación</p>
                </div>

                <div className="space-y-6">
                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección Completa *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        name="company_address"
                        value={formData.company_address}
                        onChange={handleChange}
                        placeholder="Calle 123 #45-67, Barrio Centro, Edificio Torre Norte, Oficina 501"
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {renderFieldErrors('company_address')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ciudad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <select
                        name="company_city"
                        value={formData.company_city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona tu ciudad</option>
                        {colombianCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {renderFieldErrors('company_city')}
                    </div>

                    {/* Sector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sector Empresarial *
                      </label>
                      <select
                        name="company_industry"
                        value={formData.company_industry}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona el sector</option>
                        {industries.map(industry => (
                          <option key={industry.value} value={industry.value}>
                            {industry.label}
                          </option>
                        ))}
                      </select>
                      {renderFieldErrors('company_industry')}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la Empresa (Opcional)
                    </label>
                    <textarea
                      name="company_description"
                      value={formData.company_description}
                      onChange={handleChange}
                      placeholder="Describe brevemente a qué se dedica tu empresa..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {renderFieldErrors('company_description')}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div key="step-3" className="space-y-6">
                <div className="text-center mb-6">
                  <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Administrador Principal</h2>
                  <p className="text-gray-600">Datos del usuario que administrará la empresa</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre del admin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="admin_name"
                        value={formData.admin_name}
                        onChange={handleChange}
                        placeholder="Juan Pérez García"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {renderFieldErrors('admin_name')}
                  </div>

                  {/* Email del admin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Personal *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="admin_email"
                        value={formData.admin_email}
                        onChange={handleChange}
                        placeholder="juan.perez@gmail.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {renderFieldErrors('admin_email')}
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="admin_password"
                        value={formData.admin_password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.
                    </p>
                    {renderFieldErrors('admin_password')}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="admin_password_confirmation"
                        value={formData.admin_password_confirmation}
                        onChange={handleChange}
                        placeholder="Repite la contraseña"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {renderFieldErrors('admin_password_confirmation')}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div key="step-4" className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
                  <p className="text-gray-600">Acepta nuestros términos para finalizar el registro</p>
                </div>

                {/* Resumen */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu registro:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Empresa:</strong> {formData.company_name}</p>
                      <p><strong>RUT:</strong> {formData.company_rut}</p>
                      <p><strong>Email:</strong> {formData.company_email}</p>
                    </div>
                    <div>
                      <p><strong>Administrador:</strong> {formData.admin_name}</p>
                      <p><strong>Ciudad:</strong> {formData.company_city}</p>
                      <p><strong>Sector:</strong> {industries.find(i => i.value === formData.company_industry)?.label}</p>
                    </div>
                  </div>
                </div>

                {/* Términos */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      He leído y acepto los{' '}
                      <Link to="/terms" className="text-blue-600 hover:underline">
                        Términos y Condiciones
                      </Link>{' '}
                      del servicio *
                    </label>
                  </div>
                  {getFieldError('terms_accepted') && (
                    <p className="text-red-600 text-sm ml-7">{getFieldError('terms_accepted')}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="privacy_policy_accepted"
                      checked={formData.privacy_policy_accepted}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Acepto la{' '}
                      <Link to="/privacy" className="text-blue-600 hover:underline">
                        Política de Privacidad
                      </Link>{' '}
                      y el tratamiento de mis datos personales *
                    </label>
                  </div>
                  {getFieldError('privacy_policy_accepted') && (
                    <p className="text-red-600 text-sm ml-7">{getFieldError('privacy_policy_accepted')}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.terms_accepted || !formData.privacy_policy_accepted}
                    className={`flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 ${loading || !formData.terms_accepted || !formData.privacy_policy_accepted ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Registrar Empresa
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="text-blue-600 hover:underline font-medium">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default CompanyRegister;
