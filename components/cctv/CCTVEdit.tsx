'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { CCTV } from './types';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

type EditCCTVDialogProps = {
	open: boolean;
	onClose: () => void;
	cctv: CCTV | null;
	onEditCCTV: (
		id: string,
		cctv: {
			name: string;
			rtspUrl: string;
			latitude: number;
			longitude: number;
			status: string;
		}
	) => void;
};

export function EditCCTVDialog({
	open,
	onClose,
	cctv,
	onEditCCTV,
}: EditCCTVDialogProps) {
	const [name, setName] = React.useState('');
	const [rtspUrl, setRtspUrl] = React.useState('');
	const [status, setStatus] = React.useState('active');
	const [location, setLocation] = React.useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	React.useEffect(() => {
		if (cctv) {
			setName(cctv.name);
			setRtspUrl(cctv.rtspUrl);
			setStatus(cctv.status);
			setLocation({
				latitude: cctv.latitude,
				longitude: cctv.longitude,
			});
		}
	}, [cctv]);

	const handleDialogClose = () => {
		onClose();
	};

	const handleMapClick = (lat: number, lng: number) => {
		setLocation({ latitude: lat, longitude: lng });
	};

	const isValidRtspUrl = (url: string) => {
		const rtspRegex = /^rtsp:\/\/.+/;
		return rtspRegex.test(url);
	};

	const handleSubmit = () => {
		if (!cctv || !name || !rtspUrl || !location) {
			alert('Please fill in all fields and select a location.');
			return;
		}

		if (!isValidRtspUrl(rtspUrl)) {
			alert('Please enter a valid RTSP URL (must start with rtsp://).');
			return;
		}

		const formData = {
			name,
			rtspUrl,
			latitude: location.latitude,
			longitude: location.longitude,
			status,
		};

		onEditCCTV(cctv.id, formData);

		handleDialogClose();
	};

	if (!cctv) return null;

	return (
		<Dialog open={open} onOpenChange={handleDialogClose}>
			<DialogContent className='h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] overflow-auto bg-gray-900 p-0 text-white'>
				<div className='flex h-full flex-col'>
					<DialogHeader className='border-b border-gray-700 p-6'>
						<DialogTitle className='text-xl font-semibold text-gray-100'>
							Edit CCTV Camera
						</DialogTitle>
					</DialogHeader>

					<div className='flex h-full flex-1 overflow-hidden'>
						{/* Left Side: Form */}
						<div className='flex w-1/3 flex-col space-y-6 border-r border-gray-700 p-6'>
							{/* CCTV Name */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									CCTV Name
								</label>
								<Input
									placeholder='Enter CCTV name'
									value={name}
									onChange={e => setName(e.target.value)}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
								/>
							</div>

							{/* CCTV RTSP URL */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									RTSP Stream URL
								</label>
								<Input
									placeholder='rtsp://username:password@camera-ip:port/stream'
									value={rtspUrl}
									onChange={e => setRtspUrl(e.target.value)}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
								/>
								<p className='mt-1 text-xs text-gray-400'>
									Example:
									rtsp://admin:password@192.168.1.100:554/h264/ch1/main/av_stream
								</p>
							</div>

							{/* CCTV Status */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Status
								</label>
								<Select value={status} onValueChange={setStatus}>
									<SelectTrigger className='border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500'>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent className='border-gray-700 bg-gray-800 text-white'>
										<SelectItem value='active' className='hover:bg-gray-700'>
											Active
										</SelectItem>
										<SelectItem value='inactive' className='hover:bg-gray-700'>
											Inactive
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Location Display */}
							{location && (
								<div className='rounded-md border border-gray-700 bg-gray-800 p-4'>
									<h3 className='mb-2 text-sm font-medium text-gray-300'>
										Selected Location
									</h3>
									<div className='grid grid-cols-2 gap-2'>
										<div>
											<p className='text-xs text-gray-400'>Latitude</p>
											<p className='text-sm text-white'>
												{location.latitude.toFixed(6)}
											</p>
										</div>
										<div>
											<p className='text-xs text-gray-400'>Longitude</p>
											<p className='text-sm text-white'>
												{location.longitude.toFixed(6)}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Spacer to push buttons to bottom */}
							<div className='flex-grow'></div>

							{/* Buttons */}
							<DialogFooter className='border-t border-gray-700 pt-4'>
								<Button
									variant='outline'
									onClick={handleDialogClose}
									className='border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'>
									Cancel
								</Button>
								<Button
									onClick={handleSubmit}
									className='bg-blue-600 text-white hover:bg-blue-700'>
									Save Changes
								</Button>
							</DialogFooter>
						</div>

						{/* Right Side: Map */}
						<div className='flex w-2/3 flex-col'>
							<div className='p-6 pb-3'>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Adjust Location on Map
								</label>
								<p className='mb-2 text-sm text-gray-400'>
									Click on the map to update the CCTV location
								</p>
							</div>
							<div className='relative flex-1 px-6 pb-6'>
								<div className='absolute inset-0 mx-6 mb-6 overflow-hidden rounded-md border border-gray-700'>
									<MapComponent
										onLocationSelect={latlng =>
											handleMapClick(latlng.lat, latlng.lng)
										}
										marker={
											location
												? {
														latitude: location.latitude,
														longitude: location.longitude,
													}
												: null
										}
										initialZoom={15}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
