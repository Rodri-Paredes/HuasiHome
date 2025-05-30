import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register, error, clearError } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateForm = () => {
    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return false;
    }
    
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(email, password, displayName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-primary-500 p-3 rounded-full inline-flex">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-secondary-900">
              Crear cuenta
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Únete a HuasiHome para encontrar tu hogar ideal
            </p>
          </div>

          {/* Registration Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              {/* Full Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-secondary-700">
                  Nombre completo
                </label>
                <div className="mt-1">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    className="input"
                    placeholder="Juan Pérez"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="********"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                      setValidationError('');
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  Confirmar contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setValidationError('');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {(error || validationError) && (
              <div className="text-sm text-error-500 bg-error-500/10 p-3 rounded-md">
                {error || validationError}
              </div>
            )}

            {/* Terms and Privacy */}
            <div className="text-xs text-secondary-500">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Términos de servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Política de privacidad
              </a>
              .
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="btn-primary w-full flex justify-center py-3"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Registrarse
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-secondary-500">¿Ya tienes cuenta?</span>{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-secondary-500">
        &copy; 2025 HuasiHome. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default RegisterPage;