import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getDatabase, ref, onValue, get, set } from 'firebase/database';
import  uploadPropertyToFirebase  from '../utils/firebaseHelpers';
import app from '../firebase/config';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [favorites, setFavorites] = useState<string[]>([]);

 useEffect(() => {
  setLoading(true);

  const db = getDatabase(app);
  const propertiesRef = ref(db, 'properties'); // 'properties' es el nodo raíz en la BD

  const unsubscribe = onValue(propertiesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convertimos el objeto de propiedades en array
      const propertiesArray: Property[] = Object.values(data);
      setProperties(propertiesArray);
    } else {
      setProperties([]);
    }
    setLoading(false);
  }, (error) => {
    console.error('Error leyendo propiedades:', error);
    setError('Error al cargar propiedades');
    setLoading(false);
  });

  return () => {
    // Desuscribimos el listener para evitar fugas de memoria
    unsubscribe();
  };
}, []);


useEffect(() => {
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      const userFavoritesRef = ref(db, `users/${user.id}/favorites`);
      const snapshot = await get(userFavoritesRef);

      if (snapshot.exists()) {
        setFavorites(snapshot.val());
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
      setFavorites([]);
    }
  };

  fetchFavorites();
}, [user]);

const addProperty = async (
  propertyData: Omit<Property, 'id' | 'images' | 'createdAt' | 'updatedAt' | 'ownerId'>,
  images: File[]
): Promise<string> => {
  try {
    if (!user) throw new Error('Debes iniciar sesión para publicar una propiedad');
    if (!user.id) throw new Error('El usuario no tiene un ID válido');

    console.log('Usuario actual:', user); // 👈 Para depuración

    setLoading(true);

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
      ownerId: user.id,           // ✅ Ya no será undefined
      createdAt: now,
      updatedAt: now,
    };

    // Guardar localmente
    const updatedProperties = [...properties, newProperty];
    setProperties(updatedProperties);
    localStorage.setItem('properties', JSON.stringify(updatedProperties));

    // Subir a Firestore
    await uploadPropertyToFirebase(newProperty);

    return newProperty.id;
  } catch (err) {
    console.error('Error al agregar la propiedad:', err);
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

    const db = getDatabase(app);
    const userFavoritesRef = ref(db, `users/${user.id}/favorites`);

    // Obtener favoritos actuales del usuario
    const snapshot = await get(userFavoritesRef);
    let currentFavorites: string[] = [];

    if (snapshot.exists()) {
      currentFavorites = snapshot.val();
    }

    let updatedFavorites: string[];

    if (currentFavorites.includes(propertyId)) {
      // Quitar de favoritos
      updatedFavorites = currentFavorites.filter(id => id !== propertyId);
    } else {
      // Agregar a favoritos
      updatedFavorites = [...currentFavorites, propertyId];
    }

    // Guardar favoritos actualizados en Firebase
    await set(userFavoritesRef, updatedFavorites);
  } catch (err) {
    console.error(err);
    setError('Error al actualizar favoritos');
    throw err;
  } finally {
    setLoading(false);
  }
};

const isFavorite = (propertyId: string): boolean => {
  return favorites.includes(propertyId);
};

// Propiedades favoritas del usuario (objetos completos)
const favoritedProperties = properties.filter(p => favorites.includes(p.id));

  const value = {
    properties,
    loading,
    error,
    filters,
    selectedProperty,
    favorites,
    favoritedProperties, // <-- Agregado aquí
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