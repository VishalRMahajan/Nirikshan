'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
	onLocationSelect: (latlng: { lat: number; lng: number }) => void;
	marker: { latitude: number; longitude: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
	onLocationSelect,
	marker,
}) => {
	// Custom component to handle map click events
	const LocationMarker = () => {
		useMapEvents({
			click(e) {
				onLocationSelect(e.latlng); // Pass the clicked location to the parent
			},
		});
		return null;
	};

	return (
		<MapContainer center={[18.75, 73.4]} zoom={10} className='h-96 w-full'>
			<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
			{/* Render the selected marker */}
			{marker && <Marker position={[marker.latitude, marker.longitude]} />}
			{/* Handle map click events */}
			<LocationMarker />
		</MapContainer>
	);
};

export default MapComponent;
