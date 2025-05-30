import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export type TransactionType = 'venta' | 'anticrético' | 'alquiler';

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  currency: 'USD' | 'BOB';
  transactionType: TransactionType;
  propertyType: 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina';
  landSize: number;
  constructionSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  features: string[];
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyFilter {
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  city?: string;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: PropertyFilter;
  selectedProperty: Property | null;
  favoritedProperties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'ownerId'>, images: File[]) => Promise<string>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setFilters: (filters: PropertyFilter) => void;
  setSelectedProperty: (property: Property | null) => void;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
}

export const PropertyContext = createContext<PropertyContextType | null>(null);

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider = ({ children }: PropertyProviderProps) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoritedProperties, setFavoritedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Load properties from localStorage on mount
  useEffect(() => {
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
    }
    setLoading(false);
  }, []);

  // Update favorited properties when user or properties change
  useEffect(() => {
    if (user && properties.length > 0) {
      const favorites = properties.filter(property => 
        user.favorites?.includes(property.id)
      );
      setFavoritedProperties(favorites);
    } else {
      setFavoritedProperties([]);
    }
  }, [user, properties]);

  const addProperty = async (
    propertyData: Omit<Property, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'ownerId'>,
    images: File[]
  ): Promise<string> => {
    try {
      if (!user) throw new Error('Debes iniciar sesión para publicar una propiedad');

      setLoading(true);

      // Convert images to data URLs
      const imageUrls = await Promise.all(
        images.map(image => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        }))
      );

      const now = new Date().toISOString();
      const newProperty: Property = {
        ...propertyData,
        id: crypto.randomUUID(),
        images: imageUrls,
        ownerId: user.id,
        createdAt: now,
        updatedAt: now,
      };

      const updatedProperties = [...properties, newProperty];
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      return newProperty.id;
    } catch (err) {
      setError('Error al agregar la propiedad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id: string, propertyUpdates: Partial<Property>): Promise<void> => {
    try {
      if (!user) throw new Error('Debes iniciar sesión para actualizar una propiedad');

      setLoading(true);

      const updatedProperties = properties.map(property =>
        property.id === id
          ? { ...property, ...propertyUpdates, updatedAt: new Date().toISOString() }
          : property
      );

      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      if (selectedProperty?.id === id) {
        setSelectedProperty(prev => prev ? { ...prev, ...propertyUpdates } : null);
      }
    } catch (err) {
      setError('Error al actualizar la propiedad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: string): Promise<void> => {
    try {
      if (!user) throw new Error('Debes iniciar sesión para eliminar una propiedad');

      setLoading(true);

      const updatedProperties = properties.filter(property => property.id !== id);
      setProperties(updatedProperties);
      localStorage.setItem('properties', JSON.stringify(updatedProperties));

      if (selectedProperty?.id === id) {
        setSelectedProperty(null);
      }
    } catch (err) {
      setError('Error al eliminar la propiedad');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string): Promise<void> => {
    try {
      if (!user) throw new Error('Debes iniciar sesión para guardar favoritos');

      setLoading(true);

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);

      if (userIndex === -1) throw new Error('Usuario no encontrado');

      let updatedFavorites: string[];
      if (users[userIndex].favorites?.includes(propertyId)) {
        updatedFavorites = users[userIndex].favorites.filter((id: string) => id !== propertyId);
      } else {
        updatedFavorites = [...(users[userIndex].favorites || []), propertyId];
      }

      users[userIndex].favorites = updatedFavorites;
      localStorage.setItem('users', JSON.stringify(users));

      const updatedUser = { ...user, favorites: updatedFavorites };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError('Error al actualizar favoritos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return user?.favorites?.includes(propertyId) || false;
  };

  const value = {
    properties,
    loading,
    error,
    filters,
    selectedProperty,
    favoritedProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    setFilters,
    setSelectedProperty,
    toggleFavorite,
    isFavorite,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};