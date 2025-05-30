import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, Home, MapPin, Ruler, BedDouble, Bath, Car } from 'lucide-react';
import { Property } from '../contexts/PropertyContext';
import { useProperties } from '../hooks/useProperties';
import { formatCurrency } from '../utils/formatters';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

const PropertyCard = ({ property, compact = false }: PropertyCardProps) => {
  const { toggleFavorite, isFavorite } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const favorite = isFavorite(property.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(property.id);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const getTransactionTypeColor = () => {
    switch (property.transactionType) {
      case 'venta':
        return 'bg-primary-500';
      case 'anticrético':
        return 'bg-warning-500';
      case 'alquiler':
        return 'bg-success-500';
      default:
        return 'bg-primary-500';
    }
  };

  // Calculate aspect ratio for image container
  const aspectRatio = compact ? 'aspect-[4/3]' : 'aspect-[16/9]';

  return (
    <Link 
      to={`/property/${property.id}`} 
      className={`card group hover:transform hover:-translate-y-1 transition-all duration-300 ${compact ? 'max-w-xs' : 'w-full'}`}
    >
      {/* Image Carousel */}
      <div className={`relative overflow-hidden ${aspectRatio}`}>
        {property.images.length > 0 ? (
          <img 
            src={property.images[currentImageIndex]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
            <Home className="h-12 w-12 text-secondary-400" />
          </div>
        )}

        {/* Transaction type badge */}
        <div className={`absolute top-3 left-3 text-white px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeColor()}`}>
          {property.transactionType.charAt(0).toUpperCase() + property.transactionType.slice(1)}
        </div>

        {/* Favorite button */}
        <button 
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
        >
          <Heart className={`h-5 w-5 ${favorite ? 'fill-primary-500 text-primary-500' : 'text-secondary-500'}`} />
        </button>

        {/* Carousel controls - only show if multiple images */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 text-secondary-700" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 text-secondary-700" />
            </button>
            
            {/* Image indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center text-secondary-500 mt-1 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </div>
        
        <div className="mt-2">
          <p className="text-xl font-bold text-primary-600">
            {formatCurrency(property.price, property.currency)}
          </p>
        </div>
        
        {!compact && (
          <p className="mt-2 text-secondary-600 line-clamp-2 text-sm">
            {property.description}
          </p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-secondary-600">
          {property.landSize && (
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1" />
              <span>{property.landSize} m²</span>
            </div>
          )}
          
          {property.constructionSize && (
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span>{property.constructionSize} m²</span>
            </div>
          )}
          
          {property.bedrooms && (
            <div className="flex items-center">
              <BedDouble className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          
          {property.parkingSpots && (
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-1" />
              <span>{property.parkingSpots}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;