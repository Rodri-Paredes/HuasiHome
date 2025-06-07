import { useState, useEffect } from 'react';
import { Search, Sliders, MapPin, Home, Building, Map as MapIcon } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { TransactionType } from '../contexts/PropertyContext';

interface FilterBarProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const FilterBar = ({ selectedCity, setSelectedCity }: FilterBarProps) => {
  const { filters, setFilters } = useProperties();
  const [showFilters, setShowFilters] = useState(false);
  
  const [localFilters, setLocalFilters] = useState({
    transactionType: filters.transactionType || 'all',
    minPrice: filters.minPrice || 0,
    maxPrice: filters.maxPrice || 1000000,
    propertyType: filters.propertyType || 'all',
    city: filters.city || '',
  });

  // Sync local filters with context filters when they change externally
  useEffect(() => {
    setLocalFilters({
      transactionType: filters.transactionType || 'all',
      minPrice: filters.minPrice || 0,
      maxPrice: filters.maxPrice || 1000000,
      propertyType: filters.propertyType || 'all',
      city: filters.city || '',
    });
  }, [filters]);

  const handleTransactionTypeChange = (type: string) => {
    const newType = type === 'all' ? undefined : type as TransactionType;
    setLocalFilters({ ...localFilters, transactionType: type });
    setFilters({ ...filters, transactionType: newType });
  };

  const handlePropertyTypeChange = (type: string) => {
    const newType = type === 'all' ? undefined : type;
    setLocalFilters({ ...localFilters, propertyType: type });
    setFilters({ ...filters, propertyType: newType });
  };

  const handlePriceChange = (min: number, max: number) => {
    setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max });
    // Don't update context immediately to avoid too many rerenders while sliding
  };

  const applyPriceFilter = () => {
    setFilters({ 
      ...filters, 
      minPrice: localFilters.minPrice, 
      maxPrice: localFilters.maxPrice 
    });
  };

  const handleCityChange = (city: string) => {
    console.log('City changed:', city);

    setLocalFilters({ ...localFilters, city });
    setFilters({ ...filters, city: city || undefined });
    setSelectedCity(city);
  };

  const clearFilters = () => {
    const resetFilters = {
      transactionType: 'all',
      minPrice: 0,
      maxPrice: 1000000,
      propertyType: 'all',
      city: '',
    };
    
    setLocalFilters(resetFilters);
    setFilters({});
  };

  const isActiveTransactionType = (type: string) => {
    return type === 'all' 
      ? !filters.transactionType 
      : filters.transactionType === type;
  };

  const isActivePropertyType = (type: string) => {
    return type === 'all' 
      ? !filters.propertyType 
      : filters.propertyType === type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3">
        {/* Basic filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Transaction Type Filters */}
          <div className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActiveTransactionType('all')
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
              onClick={() => handleTransactionTypeChange('all')}
            >
              Todos
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActiveTransactionType('venta')
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
              onClick={() => handleTransactionTypeChange('venta')}
            >
              Venta
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActiveTransactionType('anticrético')
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
              onClick={() => handleTransactionTypeChange('anticrético')}
            >
              Anticrético
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActiveTransactionType('alquiler')
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
              onClick={() => handleTransactionTypeChange('alquiler')}
            >
              Alquiler
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* More Filters Button */}
          <button
            className="flex items-center space-x-1 px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 rounded-full text-sm font-medium text-secondary-700 transition-colors"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Sliders className="h-4 w-4" />
            <span>Filtros</span>
          </button>

          {/* Search button */}
          <button className="btn-primary py-1.5">
            <Search className="h-4 w-4 mr-1" />
            <span>Buscar</span>
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-secondary-200 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* City selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Ciudad
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-secondary-400" />
                  </span>
                  <select
                    className="input pl-10"
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    <option value="">Todas las ciudades</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Sucre">Sucre</option>
                    <option value="Tarija">Tarija</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Tipo de Propiedad
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                      isActivePropertyType('all')
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                    onClick={() => handlePropertyTypeChange('all')}
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Todos
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                      isActivePropertyType('casa')
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                    onClick={() => handlePropertyTypeChange('casa')}
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Casas
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                      isActivePropertyType('departamento')
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                    onClick={() => handlePropertyTypeChange('departamento')}
                  >
                    <Building className="h-4 w-4 mr-1" />
                    Departamentos
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center ${
                      isActivePropertyType('terreno')
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                    onClick={() => handlePropertyTypeChange('terreno')}
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Terrenos
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-secondary-700">
                    Rango de Precio
                  </label>
                  <span className="text-xs text-secondary-500">
                    {formatPrice(localFilters.minPrice)} - {formatPrice(localFilters.maxPrice)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={localFilters.minPrice}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value), localFilters.maxPrice)}
                    onMouseUp={applyPriceFilter}
                    onTouchEnd={applyPriceFilter}
                    className="w-full accent-primary-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={localFilters.maxPrice}
                    onChange={(e) => handlePriceChange(localFilters.minPrice, parseInt(e.target.value))}
                    onMouseUp={applyPriceFilter}
                    onTouchEnd={applyPriceFilter}
                    className="w-full accent-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear filters button */}
            <div className="mt-4 flex justify-end">
              <button
                className="btn-secondary text-sm"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;