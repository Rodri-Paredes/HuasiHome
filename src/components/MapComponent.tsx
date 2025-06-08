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

// @ts-ignore
import pinSvgRaw from '../../public/pin.svg?raw';

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
  // Reemplaza el fill y fuerza el tamaño a 32x32px
  let svg = pinSvgRaw
    .replace(/fill="#([0-9A-Fa-f]{6})"/, `fill="${color}"`)
    .replace(/width="[0-9]+px"/, 'width="32px"')
    .replace(/height="[0-9]+px"/, 'height="32px"');
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
