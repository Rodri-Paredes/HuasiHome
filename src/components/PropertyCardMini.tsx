import { Property } from '../contexts/PropertyContext';
import { formatCurrency } from '../utils/formatters';
import { Home, MapPin } from 'lucide-react';

interface PropertyCardMiniProps {
  property: Property;
}

const PropertyCardMini = ({ property }: PropertyCardMiniProps) => {
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

  return (
    <div className="w-64 cursor-pointer hover:opacity-95">
      <div className="relative overflow-hidden aspect-[3/2]">
        {property.images.length > 0 ? (
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
            <Home className="h-8 w-8 text-secondary-400" />
          </div>
        )}
        
        {/* Transaction type badge */}
        <div className={`absolute top-2 left-2 text-white px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor()}`}>
          {property.transactionType.charAt(0).toUpperCase() + property.transactionType.slice(1)}
        </div>
      </div>
      
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center text-secondary-500 mt-1 text-xs">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>
        
        <p className="mt-1 text-sm font-bold text-primary-600">
          {formatCurrency(property.price, property.currency)}
        </p>
      </div>
    </div>
  );
};

export default PropertyCardMini;