import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Property } from '../contexts/PropertyContext';
import { useProperties } from '../hooks/useProperties';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MapPin, 
  Calendar, 
  Home, 
  ArrowLeft,
  User,
  Ruler,
  BedDouble,
  Bath,
  Car
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, toggleFavorite, isFavorite } = useProperties();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const favorite = property ? isFavorite(property.id) : false;

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      // First check if the property is already in the context
      const contextProperty = properties.find(p => p.id === id);
      
      if (contextProperty) {
        setProperty(contextProperty);
        setLoading(false);
        return;
      }
      
      // If not, fetch it from Firestore
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Property, 'id'>;
          setProperty({ ...data, id: docSnap.id });
        } else {
          setError('Propiedad no encontrada');
        }
      } catch (err) {
        setError('Error al cargar los detalles de la propiedad');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, properties]);

  const handleToggleFavorite = async () => {
    if (!property) return;
    await toggleFavorite(property.id);
  };

  const nextImage = () => {
    if (!property || !property.images.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!property || !property.images.length) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const getTransactionTypeColor = () => {
    if (!property) return '';
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Error</h2>
            <p className="text-secondary-600">{error || 'Propiedad no encontrada'}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 btn-primary"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-secondary-700 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Volver</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-[300px] md:h-[500px]">
            {property.images.length > 0 ? (
              <img 
                src={property.images[currentImageIndex]} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                <Home className="h-20 w-20 text-secondary-400" />
              </div>
            )}

            {/* Transaction type badge */}
            <div className={`absolute top-4 left-4 text-white px-4 py-2 rounded-full font-medium ${getTransactionTypeColor()}`}>
              {property.transactionType.charAt(0).toUpperCase() + property.transactionType.slice(1)}
            </div>

            {/* Favorite button */}
            <button 
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
            >
              <Heart className={`h-6 w-6 ${favorite ? 'fill-primary-500 text-primary-500' : 'text-secondary-500'}`} />
            </button>

            {/* Carousel controls - only show if multiple images */}
            {property.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                >
                  <ChevronLeft className="h-6 w-6 text-secondary-700" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
                >
                  <ChevronRight className="h-6 w-6 text-secondary-700" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {property.images.map((_, index) => (
                    <div 
                      key={index}
                      className={`w-3 h-3 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Property Information */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">{property.title}</h1>
                <div className="flex items-center text-secondary-500 mt-2">
                  <MapPin className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {formatCurrency(property.price, property.currency)}
                </div>
                <div className="text-sm text-secondary-500 mt-1">
                  Publicado: {new Date(property.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Detalles de la propiedad</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="text-sm text-secondary-500">Tipo de propiedad</div>
                      <div className="font-medium">
                        {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                      </div>
                    </div>
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <div className="text-sm text-secondary-500">Terreno</div>
                      <div className="font-medium flex items-center">
                        <Ruler className="h-4 w-4 mr-1 text-secondary-500" />
                        {property.landSize} m²
                      </div>
                    </div>
                    {property.constructionSize && (
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="text-sm text-secondary-500">Construcción</div>
                        <div className="font-medium flex items-center">
                          <Home className="h-4 w-4 mr-1 text-secondary-500" />
                          {property.constructionSize} m²
                        </div>
                      </div>
                    )}
                    {property.bedrooms && (
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="text-sm text-secondary-500">Dormitorios</div>
                        <div className="font-medium flex items-center">
                          <BedDouble className="h-4 w-4 mr-1 text-secondary-500" />
                          {property.bedrooms}
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="text-sm text-secondary-500">Baños</div>
                        <div className="font-medium flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-secondary-500" />
                          {property.bathrooms}
                        </div>
                      </div>
                    )}
                    {property.parkingSpots && (
                      <div className="bg-secondary-50 p-4 rounded-lg">
                        <div className="text-sm text-secondary-500">Estacionamiento</div>
                        <div className="font-medium flex items-center">
                          <Car className="h-4 w-4 mr-1 text-secondary-500" />
                          {property.parkingSpots}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Property Features */}
                  {property.features && property.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Características</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Descripción</h2>
                <p className="text-secondary-700 whitespace-pre-line">
                  {property.description}
                </p>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-3">Contactar al propietario</h3>
                  <div className="bg-secondary-50 p-4 rounded-lg flex items-start">
                    <div className="bg-primary-500 p-2 rounded-full text-white mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">Propietario</div>
                      <div className="text-sm text-secondary-500">ID: {property.ownerId.substring(0, 8)}...</div>
                      <button className="mt-2 btn-primary text-sm py-1.5">
                        Contactar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
              <div className="h-64 bg-secondary-100 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDZK9gxG0HbGdkuDCkPL0VQdj1QAeAvbO0&q=${property.location.lat},${property.location.lng}`}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;