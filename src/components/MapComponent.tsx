import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../contexts/PropertyContext';
import { useProperties } from '../hooks/useProperties';
import PropertyCardMini from './PropertyCardMini';
import { useNavigate } from 'react-router-dom';
import { Marker as LeafletMarker } from 'leaflet';
import { cityCenters } from '../utils/cityCenters';
import { transactionTypeColors } from '../utils/transactionTypeColors';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter: LatLngExpression = [-17.3935, -66.1570];

interface MapComponentProps {
  properties: Property[];
  city: string;
}

const FitBounds = ({ properties }: { properties: Property[] }) => {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const bounds = L.latLngBounds(properties.map(p => p.location as LatLngExpression));
      map.fitBounds(bounds);
    }
  }, [properties, map]);

  return null;
};

// SVG base para el pin, con marcador de color dinámico
const getMarkerIcon = (color: string) => {
  const svg = `<?xml version="1.0" encoding="utf-8"?>
  <svg fill="${color}" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016q0 1.376-0.672 3.2t-1.696 3.68-2.336 3.776-2.56 3.584-2.336 2.944-1.728 2.080l-0.672 0.736q-0.256-0.256-0.672-0.768t-1.696-2.016-2.368-3.008-2.528-3.52-2.368-3.84-1.696-3.616-0.672-3.232zM8 12q0 3.328 2.336 5.664t5.664 2.336 5.664-2.336 2.336-5.664-2.336-5.632-5.664-2.368-5.664 2.368-2.336 5.632z"></path>
  </svg>`;
  return new L.DivIcon({
    className: 'custom-pin',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const CustomMarker = ({ position, icon, children }: { position: LatLngExpression, icon: L.DivIcon, children: React.ReactNode }) => {
  const markerRef = useRef<any>(null);
  useEffect(() => {
    if (markerRef.current) {
      (markerRef.current as any).setIcon(icon);
    }
  }, [icon]);
  return (
    <Marker position={position} ref={markerRef}>
      {children}
    </Marker>
  );
};

const MapAutoCenter = ({ city }: { city: string }) => {
  const map = useMap();
  useEffect(() => {
    if (city && cityCenters[city]) {
      map.setView([cityCenters[city].lat, cityCenters[city].lng], 13);
    }
  }, [city, map]);
  return null;
};

const MapComponent = ({ properties, city }: MapComponentProps) => {
  const { setSelectedProperty } = useProperties();
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);

  // Centrar el mapa en la ciudad seleccionada al montar y cuando cambie city
  useEffect(() => {
    if (city && cityCenters[city] && mapRef.current) {
      // Usar flyTo para asegurar el centrado incluso en el primer render
      mapRef.current.flyTo([cityCenters[city].lat, cityCenters[city].lng], 13);
    }
  }, [city]);

  const getColor = (property: Property) => {
    return transactionTypeColors[property.transactionType] || '#22C55E';
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        className="h-full w-full rounded-lg z-0"
        style={{ height: '100%', width: '100%' }}
        minZoom={6}
      >
        <MapAutoCenter city={city} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map(property => (
          <CustomMarker
            key={property.id + '-' + property.location.lat + '-' + property.location.lng}
            position={[property.location.lat, property.location.lng] as LatLngExpression}
            icon={getMarkerIcon(getColor(property))}
          >
            <Popup>
              <div
                onClick={() => {
                  setSelectedProperty(property);
                  navigate(`/property/${property.id}`);
                }}
                className="cursor-pointer"
              >
                <PropertyCardMini property={property} />
              </div>
            </Popup>
          </CustomMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
