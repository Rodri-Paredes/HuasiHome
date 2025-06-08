import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { cityCenters } from './utils/cityCenters';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MapPage from './pages/MapPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import ListPropertyPage from './pages/ListPropertyPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityToSelect, setCityToSelect] = useState<string>('');

  // Redirect to login if not authenticated (except on login and register pages)
  useEffect(() => {
    const publicPaths = ['/login', '/register'];
    const citySelected = localStorage.getItem('selectedCity');
    
    if (!loading && user && publicPaths.includes(location.pathname)) {
      // Si no hay ciudad seleccionada, mostrar modal
      if (!citySelected) {
        setShowCityModal(true);
      } else {
        setShowCityModal(false);
      }
      navigate('/map');
    }
    
    if (!loading && !user && !publicPaths.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, loading, location.pathname, navigate]);

  // Handler para seleccionar ciudad
  const handleSelectCity = (city: string) => {
    localStorage.setItem('selectedCity', city);
    setShowCityModal(false);
    setCityToSelect(city);
    // Forzar recarga de la página para que el filtro se aplique (o usar un evento custom/global state)
    window.dispatchEvent(new Event('storage'));
  };

  // Limpia la ciudad seleccionada al hacer logout (esto debe hacerse en el hook de logout, pero aquí es seguro también)
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('selectedCity');
    }
  }, [user]);

  // Modal de selección de ciudad
  const renderCityModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
        <h3 className="text-lg font-semibold mb-4 text-center">¿Dónde te encuentras?</h3>
        <div className="flex flex-col gap-3">
          {Object.keys(cityCenters).map(city => (
            <button
              key={city}
              className="btn-primary w-full"
              onClick={() => handleSelectCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      {showCityModal && renderCityModal()}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/list-property" element={<ListPropertyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;