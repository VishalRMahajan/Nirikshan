'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
	onLocationSelect?: (latlng: { lat: number; lng: number }) => void;
	marker?: { latitude: number; longitude: number } | null;
	interactive?: boolean;
	initialZoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
	onLocationSelect,
	marker,
}) => {
	const LocationMarker = () => {
		useMapEvents({
			click(e) {
				onLocationSelect?.(e.latlng);
			},
		});
		return null;
	};

	return (
		<MapContainer center={[18.75, 73.4]} zoom={10} className='h-full w-full'>
			<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
			{marker && <Marker position={[marker.latitude, marker.longitude]} />}
			<LocationMarker />
		</MapContainer>
	);
};

export default MapComponent;
