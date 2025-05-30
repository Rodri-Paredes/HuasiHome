import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, X, Upload, MapPinned } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { TransactionType } from '../contexts/PropertyContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración del ícono del marcador (necesario para Leaflet)
const icon = L.icon({ 
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center - Bolivia
const defaultCenter = {
  lat: -17.3895,
  lng: -66.1568
};

// Componente para manejar los eventos del mapa
function MapEvents({ setMarkerPosition }: { setMarkerPosition: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      setMarkerPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });
  return null;
}

const ListPropertyPage = () => {
  const navigate = useNavigate();
  const { addProperty, loading } = useProperties();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Property form state
  const [property, setProperty] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    price: 0,
    currency: 'USD' as const,
    transactionType: 'venta' as TransactionType,
    propertyType: 'casa' as const,
    landSize: 0,
    constructionSize: 0,
    bedrooms: 0,
    bathrooms: 0,
    parkingSpots: 0,
    features: [] as string[],
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = [...images, ...selectedFiles].slice(0, 6); // Limit to 6 images
      setImages(newImages);
      
      // Create previews for the images
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up the URL
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Parse numeric values
    if (
      type === 'number' && 
      ['price', 'landSize', 'constructionSize', 'bedrooms', 'bathrooms', 'parkingSpots'].includes(name)
    ) {
      setProperty({ ...property, [name]: parseFloat(value) || 0 });
    } else {
      setProperty({ ...property, [name]: value });
    }
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const features = [...property.features];
    
    if (features.includes(feature)) {
      // Remove feature
      const index = features.indexOf(feature);
      features.splice(index, 1);
    } else {
      // Add feature
      features.push(feature);
    }
    
    setProperty({ ...property, features });
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!property.title.trim()) {
        errors.title = 'El título es obligatorio';
      }
      
      if (!property.description.trim()) {
        errors.description = 'La descripción es obligatoria';
      }
      
      if (property.price <= 0) {
        errors.price = 'El precio debe ser mayor a 0';
      }
    }
    
    if (step === 2) {
      if (!property.address.trim()) {
        errors.address = 'La dirección es obligatoria';
      }
      
      if (!property.city.trim()) {
        errors.city = 'La ciudad es obligatoria';
      }
      
      if (!markerPosition) {
        errors.location = 'Debes seleccionar una ubicación en el mapa';
      }
    }
    
    if (step === 3) {
      if (property.landSize <= 0) {
        errors.landSize = 'El tamaño del terreno debe ser mayor a 0';
      }
      
      if (property.propertyType !== 'terreno' && property.constructionSize <= 0) {
        errors.constructionSize = 'El tamaño de la construcción debe ser mayor a 0';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    try {
      if (!markerPosition) {
        setFormErrors({ location: 'Debes seleccionar una ubicación en el mapa' });
        return;
      }
      
      const propertyData = {
        ...property,
        location: markerPosition,
      };
      
      const propertyId = await addProperty(propertyData, images);
      navigate(`/property/${propertyId}`);
    } catch (error) {
      console.error('Error al publicar la propiedad', error);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Información básica</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={property.title}
                onChange={handleChange}
                className={`input ${formErrors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Ej: Casa de 3 dormitorios en Miraflores"
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-error-500">{formErrors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={property.description}
                onChange={handleChange}
                rows={4}
                className={`input ${formErrors.description ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Describe las características de tu propiedad..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-error-500">{formErrors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-secondary-700 mb-1">
                  Tipo de transacción *
                </label>
                <select
                  id="transactionType"
                  name="transactionType"
                  value={property.transactionType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="venta">Venta</option>
                  <option value="anticrético">Anticrético</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-secondary-700 mb-1">
                  Tipo de propiedad *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={property.propertyType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local comercial</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-secondary-700 mb-1">
                  Precio *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={property.price || ''}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`input pl-16 ${formErrors.price ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <select
                      name="currency"
                      value={property.currency}
                      onChange={handleChange}
                      className="h-full rounded-l-md border-transparent bg-transparent py-0 pl-3 pr-7 text-secondary-700 focus:border-primary-500 focus:ring-0"
                    >
                      <option value="USD">USD</option>
                      <option value="BOB">BOB</option>
                    </select>
                  </div>
                </div>
                {formErrors.price && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.price}</p>
                )}
              </div>
            </div>
            
            <div>
              <p className="block text-sm font-medium text-secondary-700 mb-2">
                Imágenes (máximo 6)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Image previews */}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-secondary-200">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-secondary-100"
                    >
                      <X className="h-4 w-4 text-secondary-700" />
                    </button>
                  </div>
                ))}
                
                {/* Add image button */}
                {images.length < 6 && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="aspect-[4/3] rounded-lg border-2 border-dashed border-secondary-300 flex flex-col items-center justify-center text-secondary-500 hover:text-primary-500 hover:border-primary-500 transition-colors"
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm">Subir</span>
                  </button>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Ubicación</h2>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-secondary-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={property.address}
                onChange={handleChange}
                className={`input ${formErrors.address ? 'border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Ej: Av. América #123, entre Colombia y Ecuador"
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-error-500">{formErrors.address}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-1">
                Ciudad *
              </label>
              <select
                id="city"
                name="city"
                value={property.city}
                onChange={handleChange}
                className={`input ${formErrors.city ? 'border-error-500 focus:ring-error-500' : ''}`}
              >
                <option value="">Selecciona una ciudad</option>
                <option value="La Paz">La Paz</option>
                <option value="El Alto">El Alto</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Sucre">Sucre</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Tarija">Tarija</option>
                <option value="Trinidad">Trinidad</option>
                <option value="Cobija">Cobija</option>
              </select>
              {formErrors.city && (
                <p className="mt-1 text-sm text-error-500">{formErrors.city}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Ubicación en el mapa *
              </label>
              <p className="text-sm text-secondary-500 mb-2">Haz clic en el mapa para marcar la ubicación de tu propiedad</p>
              
              <div className="h-[400px] rounded-lg overflow-hidden border border-secondary-200">
                <MapContainer
                  center={markerPosition || defaultCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {markerPosition && (
                    <Marker position={[markerPosition.lat, markerPosition.lng]} icon={icon} />
                  )}
                  <MapEvents setMarkerPosition={setMarkerPosition} />
                </MapContainer>
              </div>
              
              {formErrors.location && (
                <p className="mt-1 text-sm text-error-500">{formErrors.location}</p>
              )}
              
              {markerPosition && (
                <div className="mt-2 flex items-center text-sm text-secondary-600">
                  <MapPinned className="h-4 w-4 mr-1 text-primary-500" />
                  <span>Ubicación seleccionada: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}</span>
                </div>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Características</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="landSize" className="block text-sm font-medium text-secondary-700 mb-1">
                  Tamaño del terreno (m²) *
                </label>
                <input
                  type="number"
                  id="landSize"
                  name="landSize"
                  value={property.landSize || ''}
                  onChange={handleChange}
                  min="0"
                  className={`input ${formErrors.landSize ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="0"
                />
                {formErrors.landSize && (
                  <p className="mt-1 text-sm text-error-500">{formErrors.landSize}</p>
                )}
              </div>
              
              {property.propertyType !== 'terreno' && (
                <div>
                  <label htmlFor="constructionSize" className="block text-sm font-medium text-secondary-700 mb-1">
                    Tamaño de construcción (m²) *
                  </label>
                  <input
                    type="number"
                    id="constructionSize"
                    name="constructionSize"
                    value={property.constructionSize || ''}
                    onChange={handleChange}
                    min="0"
                    className={`input ${formErrors.constructionSize ? 'border-error-500 focus:ring-error-500' : ''}`}
                    placeholder="0"
                  />
                  {formErrors.constructionSize && (
                    <p className="mt-1 text-sm text-error-500">{formErrors.constructionSize}</p>
                  )}
                </div>
              )}
            </div>
            
            {property.propertyType !== 'terreno' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-secondary-700 mb-1">
                    Dormitorios
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    value={property.bedrooms || ''}
                    onChange={handleChange}
                    min="0"
                    className="input"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-secondary-700 mb-1">
                    Baños
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    value={property.bathrooms || ''}
                    onChange={handleChange}
                    min="0"
                    className="input"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="parkingSpots" className="block text-sm font-medium text-secondary-700 mb-1">
                    Estacionamientos
                  </label>
                  <input
                    type="number"
                    id="parkingSpots"
                    name="parkingSpots"
                    value={property.parkingSpots || ''}
                    onChange={handleChange}
                    min="0"
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            
            <div>
              <p className="block text-sm font-medium text-secondary-700 mb-2">
                Características adicionales
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Agua', 'Luz', 'Gas', 'Internet', 'Calefacción', 'Amoblado', 'Piscina', 'Jardín', 'Seguridad 24h', 'Ascensor', 'Terraza', 'Garaje', 'Lavandería'].map((feature) => (
                  <label 
                    key={feature} 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${
                      property.features.includes(feature) 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={property.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <div className={`flex-shrink-0 w-5 h-5 rounded border ${
                      property.features.includes(feature) 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-secondary-300'
                    } flex items-center justify-center mr-2`}>
                      {property.features.includes(feature) && (
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Revisar y publicar</h2>
            
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">{property.title}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-secondary-500">Tipo de transacción</p>
                  <p className="font-medium">{property.transactionType.charAt(0).toUpperCase() + property.transactionType.slice(1)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-secondary-500">Tipo de propiedad</p>
                  <p className="font-medium">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-secondary-500">Precio</p>
                  <p className="font-medium">{property.currency === 'USD' ? 'US$' : 'Bs.'} {property.price.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-secondary-500">Ubicación</p>
                  <p className="font-medium">{property.address}, {property.city}</p>
                </div>
                
                <div>
                  <p className="text-sm text-secondary-500">Tamaño del terreno</p>
                  <p className="font-medium">{property.landSize} m²</p>
                </div>
                
                {property.propertyType !== 'terreno' && (
                  <div>
                    <p className="text-sm text-secondary-500">Tamaño de construcción</p>
                    <p className="font-medium">{property.constructionSize} m²</p>
                  </div>
                )}
                
                {property.propertyType !== 'terreno' && property.bedrooms > 0 && (
                  <div>
                    <p className="text-sm text-secondary-500">Dormitorios</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                )}
                
                {property.propertyType !== 'terreno' && property.bathrooms > 0 && (
                  <div>
                    <p className="text-sm text-secondary-500">Baños</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                )}
                
                {property.propertyType !== 'terreno' && property.parkingSpots > 0 && (
                  <div>
                    <p className="text-sm text-secondary-500">Estacionamientos</p>
                    <p className="font-medium">{property.parkingSpots}</p>
                  </div>
                )}
              </div>
              
              {property.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-secondary-500 mb-2">Características</p>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature) => (
                      <span key={feature} className="bg-secondary-200 text-secondary-700 px-2 py-1 rounded-md text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <p className="text-sm text-secondary-500 mb-2">Descripción</p>
                <p className="text-sm">{property.description}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-secondary-500 mb-2">Imágenes ({imagePreviews.length})</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="aspect-[4/3] rounded-lg overflow-hidden border border-secondary-200">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border border-secondary-200 rounded-lg bg-secondary-50">
              <p className="text-sm text-secondary-700">
                Al publicar esta propiedad confirmas que la información proporcionada es correcta y tienes derecho a ofrecer esta propiedad para {property.transactionType}.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Información' },
      { number: 2, title: 'Ubicación' },
      { number: 3, title: 'Características' },
      { number: 4, title: 'Publicar' },
    ];

    return (
      <div className="mb-8">
        <div className="hidden sm:flex items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  activeStep >= step.number 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-secondary-200 text-secondary-700'
                }`}
              >
                {step.number}
              </div>
              <div 
                className={`ml-2 ${activeStep === step.number ? 'font-medium' : ''}`}
              >
                {step.title}
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={`w-16 h-1 mx-4 ${
                    activeStep > step.number ? 'bg-primary-500' : 'bg-secondary-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="sm:hidden text-center">
          <p className="text-sm text-secondary-500">Paso {activeStep} de 4</p>
          <p className="font-medium">{steps.find(s => s.number === activeStep)?.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Publicar Propiedad</h1>
        
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderStep()}
          
          <div className="mt-8 flex justify-between">
            {activeStep > 1 ? (
              <button 
                type="button" 
                onClick={prevStep}
                className="btn-secondary"
                disabled={loading}
              >
                Anterior
              </button>
            ) : (
              <div></div>
            )}
            
            {activeStep < 4 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="btn-primary"
                disabled={loading}
              >
                Siguiente
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    <span>Publicando...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    <span>Publicar propiedad</span>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPropertyPage;