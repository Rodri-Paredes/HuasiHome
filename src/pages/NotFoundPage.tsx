import { Link } from 'react-router-dom';
import { MapPin, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <MapPin className="h-20 w-20 text-primary-500 mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Página no encontrada</h2>
        
        <p className="text-secondary-600 mb-8">
          La página que estás buscando no existe o ha sido movida. Es posible que hayas escrito mal la dirección o que la página haya sido eliminada.
        </p>
        
        <Link 
          to="/"
          className="btn-primary py-3 px-6 inline-flex items-center"
        >
          <Home className="mr-2 h-5 w-5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;