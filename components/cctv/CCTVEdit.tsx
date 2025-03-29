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
import { Upload, Video, X } from 'lucide-react';
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
			accidentVideo?: File | null;
			removeExistingVideo?: boolean;
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
	const [accidentVideo, setAccidentVideo] = React.useState<File | null>(null);
	const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
	const [removeExistingVideo, setRemoveExistingVideo] = React.useState(false);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (cctv) {
			setName(cctv.name);
			setRtspUrl(cctv.rtspUrl);
			setStatus(cctv.status);
			setLocation({
				latitude: cctv.latitude,
				longitude: cctv.longitude,
			});

			// Reset video state when CCTV changes
			setAccidentVideo(null);
			setVideoPreview(null);
			setRemoveExistingVideo(false);
		}
	}, [cctv]);

	const handleDialogClose = () => {
		// Clean up any created object URLs
		if (videoPreview && !cctv?.accidentVideoUrl) {
			URL.revokeObjectURL(videoPreview);
		}
		onClose();
	};

	const handleMapClick = (lat: number, lng: number) => {
		setLocation({ latitude: lat, longitude: lng });
	};

	const isValidRtspUrl = (url: string) => {
		const rtspRegex = /^rtsp:\/\/.+/;
		return rtspRegex.test(url);
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;

		if (file) {
			// Validate file type
			if (!file.type.startsWith('video/')) {
				alert('Please select a valid video file.');
				return;
			}

			// Validate file size (limit to 100MB)
			if (file.size > 100 * 1024 * 1024) {
				alert('Video file size must be less than 100MB.');
				return;
			}

			setAccidentVideo(file);
			setRemoveExistingVideo(false);

			// Create a preview URL
			const url = URL.createObjectURL(file);
			setVideoPreview(url);
		}
	};

	const handleRemoveVideo = () => {
		if (cctv?.hasAccidentVideo) {
			// Mark existing video for removal
			setRemoveExistingVideo(true);
		}

		setAccidentVideo(null);

		if (videoPreview && !cctv?.accidentVideoUrl) {
			URL.revokeObjectURL(videoPreview);
		}

		setVideoPreview(null);

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
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
			accidentVideo,
			removeExistingVideo,
		};

		onEditCCTV(cctv.id, formData);
		handleDialogClose();
	};

	// Clean up video preview URL when dialog closes
	React.useEffect(() => {
		return () => {
			if (videoPreview && !cctv?.accidentVideoUrl) {
				URL.revokeObjectURL(videoPreview);
			}
		};
	}, [videoPreview, cctv]);

	if (!cctv) return null;

	// Determine which video to display
	const showExistingVideo =
		cctv.hasAccidentVideo &&
		cctv.accidentVideoUrl &&
		!removeExistingVideo &&
		!videoPreview;
	const showNewVideo = !!videoPreview;
	const videoToShow = showNewVideo
		? videoPreview
		: showExistingVideo
			? cctv.accidentVideoUrl
			: null;

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

							{/* Accident Video Upload */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Accident Video
								</label>
								<div className='space-y-3'>
									{!videoToShow ? (
										<div className='flex items-center'>
											<input
												type='file'
												ref={fileInputRef}
												accept='video/*'
												onChange={handleVideoChange}
												className='hidden'
												id='video-upload'
											/>
											<Button
												variant='outline'
												className='border-dashed border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
												onClick={() => fileInputRef.current?.click()}
												type='button'>
												<Upload className='mr-2 h-4 w-4' />
												{cctv.hasAccidentVideo
													? 'Change Video'
													: 'Upload Video'}
											</Button>
										</div>
									) : (
										<div className='space-y-2'>
											<div className='flex items-center justify-between rounded-md border border-gray-700 bg-gray-800 p-2'>
												<div className='flex items-center'>
													<Video className='mr-2 h-4 w-4 text-blue-400' />
													<span className='max-w-[180px] truncate text-sm text-gray-300'>
														{accidentVideo?.name ||
															(showExistingVideo && 'Current accident video')}
													</span>
												</div>
												<Button
													variant='ghost'
													size='icon'
													className='h-6 w-6 text-gray-400 hover:text-white'
													onClick={handleRemoveVideo}>
													<X className='h-4 w-4' />
												</Button>
											</div>
											<div className='overflow-hidden rounded-md border border-gray-700'>
												<video
													src={videoToShow || undefined}
													controls
													className='h-auto max-h-[200px] w-full'
												/>
											</div>
											{showExistingVideo && (
												<Button
													variant='outline'
													size='sm'
													className='w-full border-gray-600 text-gray-300 hover:bg-gray-700'
													onClick={() => fileInputRef.current?.click()}>
													<Upload className='mr-2 h-4 w-4' />
													Replace Video
												</Button>
											)}
										</div>
									)}
									<p className='text-xs text-gray-400'>
										Supported formats: MP4, AVI, MOV (max 100MB)
									</p>
								</div>
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
