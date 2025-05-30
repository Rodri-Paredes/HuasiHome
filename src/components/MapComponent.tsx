import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../contexts/PropertyContext';
import { useProperties } from '../hooks/useProperties';
import PropertyCardMini from './PropertyCardMini';
import { useNavigate } from 'react-router-dom';


// Fix de los íconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Centro de Cochabamba
const defaultCenter: LatLngExpression = [-17.3935, -66.1570];


interface MapComponentProps {
  properties: Property[];
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

const getMarkerIcon = (color: string) =>
  new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });


const MapComponent = ({ properties }: MapComponentProps) => {
  const { setSelectedProperty } = useProperties();
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const navigate = useNavigate();

  const getColor = (property: Property) => {
    return property.transactionType === 'venta'
      ? '#E84118'
      : property.transactionType === 'anticrético'
        ? '#F59E0B'
        : '#22C55E'; // alquiler
  };

  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full rounded-lg z-0"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds properties={properties} />

        {properties.map(property => (
          <Marker
            key={property.id}
            position={property.location as LatLngExpression}
            icon={getMarkerIcon(getColor(property))}
            eventHandlers={{
              click: () => {
                setActiveMarker(activeMarker === property.id ? null : property.id);
              },
            }}
          >
            {activeMarker === property.id && (
<Popup onClose={() => setActiveMarker(null)}>
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

            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
