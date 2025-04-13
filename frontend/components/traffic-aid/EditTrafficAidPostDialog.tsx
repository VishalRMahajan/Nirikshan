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
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TrafficAidPost } from './types';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

interface EditTrafficAidPostDialogProps {
	open: boolean;
	onClose: () => void;
	post: TrafficAidPost;
	onEditPost: (
		id: string,
		data: {
			name: string;
			address: string;
			latitude: number;
			longitude: number;
			contactNumber: string;
			hasPoliceService: boolean;
			hasAmbulance: boolean;
			hasFireService: boolean;
			operatingHours: string;
			status: string;
			additionalInfo?: string;
		}
	) => void;
}

export function EditTrafficAidPostDialog({
	open,
	onClose,
	post,
	onEditPost,
}: EditTrafficAidPostDialogProps) {
	const [name, setName] = React.useState(post.name);
	const [address, setAddress] = React.useState(post.address);
	const [status, setStatus] = React.useState(post.status);
	const [location, setLocation] = React.useState<{
		latitude: number;
		longitude: number;
	}>({
		latitude: post.latitude,
		longitude: post.longitude,
	});
	const [contactNumber, setContactNumber] = React.useState(post.contactNumber);
	const [hasPoliceService, setHasPoliceService] = React.useState(
		post.hasPoliceService
	);
	const [hasAmbulance, setHasAmbulance] = React.useState(post.hasAmbulance);
	const [hasFireService, setHasFireService] = React.useState(
		post.hasFireService
	);
	const [operatingHours, setOperatingHours] = React.useState(
		post.operatingHours
	);
	const [additionalInfo, setAdditionalInfo] = React.useState(
		post.additionalInfo || ''
	);

	// Update state when post changes
	React.useEffect(() => {
		setName(post.name);
		setAddress(post.address);
		setStatus(post.status);
		setLocation({
			latitude: post.latitude,
			longitude: post.longitude,
		});
		setContactNumber(post.contactNumber);
		setHasPoliceService(post.hasPoliceService);
		setHasAmbulance(post.hasAmbulance);
		setHasFireService(post.hasFireService);
		setOperatingHours(post.operatingHours);
		setAdditionalInfo(post.additionalInfo || '');
	}, [post]);

	const handleMapClick = (lat: number, lng: number) => {
		setLocation({ latitude: lat, longitude: lng });
	};

	const handleSubmit = () => {
		if (!name || !address || !location || !contactNumber) {
			alert('Please fill in all required fields and select a location.');
			return;
		}

		onEditPost(post.id, {
			name,
			address,
			latitude: location.latitude,
			longitude: location.longitude,
			contactNumber,
			hasPoliceService,
			hasAmbulance,
			hasFireService,
			operatingHours,
			status,
			additionalInfo,
		});
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] overflow-auto bg-gray-900 p-0 text-white'>
				<div className='flex h-full flex-col'>
					<DialogHeader className='border-b border-gray-700 p-6'>
						<DialogTitle className='text-xl font-semibold text-gray-100'>
							Edit Traffic Aid Post
						</DialogTitle>
					</DialogHeader>

					<div className='flex h-full flex-1 overflow-hidden'>
						{/* Left Side: Form */}
						<div className='flex w-1/3 flex-col space-y-6 border-r border-gray-700 p-6'>
							{/* Post Name */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Post Name*
								</label>
								<Input
									placeholder='Enter post name'
									value={name}
									onChange={e => setName(e.target.value)}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
								/>
							</div>

							{/* Post Address */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Address*
								</label>
								<Textarea
									placeholder='Enter complete address'
									value={address}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setAddress(e.target.value)
									}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
									rows={3}
								/>
							</div>

							{/* Contact Number */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Contact Number*
								</label>
								<Input
									placeholder='Enter contact number'
									value={contactNumber}
									onChange={e => setContactNumber(e.target.value)}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
								/>
							</div>

							{/* Available Services */}
							<div>
								<label className='mb-3 block text-sm font-medium text-gray-300'>
									Available Services
								</label>
								<div className='space-y-3'>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='police'
											checked={hasPoliceService}
											onCheckedChange={checked =>
												setHasPoliceService(checked === true)
											}
											className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
										/>
										<Label htmlFor='police' className='text-gray-300'>
											Traffic Police
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='ambulance'
											checked={hasAmbulance}
											onCheckedChange={checked =>
												setHasAmbulance(checked === true)
											}
											className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
										/>
										<Label htmlFor='ambulance' className='text-gray-300'>
											Ambulance
										</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<Checkbox
											id='fire'
											checked={hasFireService}
											onCheckedChange={checked =>
												setHasFireService(checked === true)
											}
											className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
										/>
										<Label htmlFor='fire' className='text-gray-300'>
											Fire Department
										</Label>
									</div>
								</div>
							</div>

							{/* Operating Hours */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Operating Hours
								</label>
								<Input
									placeholder='e.g., 24/7 or 8:00 AM - 8:00 PM'
									value={operatingHours}
									onChange={e => setOperatingHours(e.target.value)}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
								/>
							</div>

							{/* Additional Info */}
							<div>
								<label className='mb-2 block text-sm font-medium text-gray-300'>
									Additional Information
								</label>
								<Textarea
									placeholder='Enter any additional details about this aid post'
									value={additionalInfo}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setAdditionalInfo(e.target.value)
									}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
									rows={3}
								/>
							</div>

							{/* Post Status */}
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
										<SelectItem
											value='maintenance'
											className='hover:bg-gray-700'>
											Under Maintenance
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

							{/* Buttons */}
							<DialogFooter className='border-t border-gray-700 pt-4'>
								<Button
									variant='outline'
									onClick={onClose}
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
									Edit Location on Map*
								</label>
								<p className='mb-2 text-sm text-gray-400'>
									Click on the map to change the aid post location
								</p>
							</div>
							<div className='relative flex-1 px-6 pb-6'>
								<div className='absolute inset-0 mx-6 mb-6 overflow-hidden rounded-xl border border-gray-700'>
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
