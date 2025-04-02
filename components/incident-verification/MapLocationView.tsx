'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface MapLocationViewProps {
	latitude: number;
	longitude: number;
	incidentName?: string;
	className?: string;
}

export function MapLocationView({
	latitude,
	longitude,
	incidentName = 'Incident Location',
	className = '',
}: MapLocationViewProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.Marker | null>(null);

	useEffect(() => {
		// Skip if no valid coordinates
		if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
			return;
		}

		// Function to initialize the map
		const initializeMap = async () => {
			if (typeof google === 'undefined') {
				// Load Google Maps API if not already loaded
				const script = document.createElement('script');
				script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
				script.async = true;
				document.head.appendChild(script);

				script.onload = () => {
					createMap();
				};
			} else {
				createMap();
			}
		};

		// Function to create the map
		const createMap = () => {
			if (mapRef.current && typeof google !== 'undefined') {
				const position = { lat: latitude, lng: longitude };

				// Create map instance
				const mapOptions: google.maps.MapOptions = {
					center: position,
					zoom: 15,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					fullscreenControl: false,
					mapTypeControl: false,
					streetViewControl: false,
					styles: [
						{
							featureType: 'all',
							elementType: 'geometry',
							stylers: [{ color: '#242f3e' }],
						},
						{
							featureType: 'all',
							elementType: 'labels.text.stroke',
							stylers: [{ color: '#242f3e' }],
						},
						{
							featureType: 'all',
							elementType: 'labels.text.fill',
							stylers: [{ color: '#746855' }],
						},
						{
							featureType: 'road',
							elementType: 'geometry',
							stylers: [{ color: '#38414e' }],
						},
						{
							featureType: 'water',
							elementType: 'geometry',
							stylers: [{ color: '#17263c' }],
						},
					],
				};

				mapInstanceRef.current = new google.maps.Map(
					mapRef.current,
					mapOptions
				);

				// Create a marker
				markerRef.current = new google.maps.Marker({
					position,
					map: mapInstanceRef.current,
					title: incidentName,
					animation: google.maps.Animation.DROP,
				});

				// Add info window
				const infoWindow = new google.maps.InfoWindow({
					content: `<div style="color: #000;">${incidentName}</div>`,
				});

				markerRef.current.addListener('click', () => {
					infoWindow.open(mapInstanceRef.current, markerRef.current);
				});
			}
		};

		initializeMap();

		return () => {
			// Cleanup
			if (markerRef.current) {
				markerRef.current.setMap(null);
			}
		};
	}, [latitude, longitude, incidentName]);

	// If coordinates are invalid
	if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
		return (
			<div
				className={`flex flex-col items-center justify-center rounded-md border border-gray-700 bg-gray-800 p-6 text-center ${className}`}>
				<MapPin className='mb-2 h-8 w-8 text-gray-500' />
				<p className='text-gray-400'>Location data unavailable</p>
			</div>
		);
	}

	return (
		<div
			className={`relative overflow-hidden rounded-md border border-gray-700 ${className}`}>
			<div ref={mapRef} className='h-full min-h-[200px] w-full' />
			<div className='absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white'>
				{latitude.toFixed(5)}, {longitude.toFixed(5)}
			</div>
		</div>
	);
}
