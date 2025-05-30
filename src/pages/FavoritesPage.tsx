import { useProperties } from '../hooks/useProperties';
import PropertyCard from '../components/PropertyCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const { favoritedProperties, loading } = useProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Mis Favoritos</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : favoritedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-secondary-400" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-800 mb-2">
              No tienes favoritos aún
            </h2>
            <p className="text-secondary-600 mb-6">
              Guarda propiedades para verlas más tarde y comparar opciones.
            </p>
            <Link to="/map" className="btn-primary">
              Explorar propiedades
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;