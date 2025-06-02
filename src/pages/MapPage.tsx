import { useEffect, useState } from 'react';
import { useProperties } from '../hooks/useProperties';
import MapComponent from '../components/MapComponent';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import { X, MapPin, List } from 'lucide-react';

const MapPage = () => {
  const { properties, loading, selectedProperty, setSelectedProperty } = useProperties();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  

  useEffect(() => {
    return () => {
      setSelectedProperty(null);
    };
  }, [setSelectedProperty]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      <FilterBar />
      <div className="md:hidden bg-white border-t border-secondary-200 p-2 flex">
        <button 
          className={`flex-1 flex justify-center items-center space-x-1 py-2 rounded-l-lg transition-colors ${
            viewMode === 'map' 
              ? 'bg-primary-500 text-white' 
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
          onClick={() => setViewMode('map')}
        >
          <MapPin className="h-4 w-4" />
          <span>Mapa</span>
        </button>
        <button 
          className={`flex-1 flex justify-center items-center space-x-1 py-2 rounded-r-lg transition-colors ${
            viewMode === 'list' 
              ? 'bg-primary-500 text-white' 
              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
          }`}
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
          <span>Lista</span>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        <div 
          className={`${
            viewMode === 'map' ? 'flex' : 'hidden'
          } md:flex flex-1 relative ${selectedProperty ? 'md:w-2/3' : 'md:w-full'} transition-all duration-300`}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <MapComponent properties={properties} />
          )}
        </div>

        {viewMode === 'list' && (
          <div className="flex-1 md:hidden bg-secondary-50 overflow-y-auto">
            <div className="container mx-auto p-4">
              <h2 className="text-xl font-bold mb-4">Propiedades ({properties.length})</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <MapPin className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-800">No hay propiedades</h3>
                  <p className="mt-2 text-secondary-600">
                    No se encontraron propiedades con los filtros seleccionados.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        

        {selectedProperty && (
          <div className="bg-white md:w-1/3 flex flex-col max-h-[60vh] md:max-h-full md:h-auto overflow-hidden transition-all duration-300 shadow-lg md:shadow-none z-10">
            <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold line-clamp-1">{selectedProperty.title}</h2>
              <button 
                onClick={() => setSelectedProperty(null)}
                className="p-1 rounded-full hover:bg-secondary-100"
              >
                <X className="h-5 w-5 text-secondary-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PropertyCard property={selectedProperty} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;