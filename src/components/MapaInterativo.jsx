
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapaInterativo() {
  return (
    <div style={{ width: '100%', height: '480px' }}>
      <MapContainer
        center={[-23.5089, -46.5817]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={[-23.5089, -46.5817]}>
          <Popup>
            Território de referência: Parque Vila Maria
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
