import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Phone, ExternalLink } from 'lucide-react';
import { TrafficAidPost } from './types';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

interface TrafficAidPostViewDetailsProps {
	open: boolean;
	onClose: () => void;
	post: TrafficAidPost;
}

export function TrafficAidPostViewDetails({
	open,
	onClose,
	post,
}: TrafficAidPostViewDetailsProps) {
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});
		} catch (error) {
			return 'Invalid date';
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl bg-gray-900 p-0 text-white'>
				<DialogHeader className='border-b border-gray-700 p-6'>
					<DialogTitle className='text-xl font-semibold text-gray-100'>
						{post.name}
					</DialogTitle>
					<div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-400'>
						<span className='flex items-center gap-1'>
							<Calendar className='h-3.5 w-3.5' />
							Created: {formatDate(post.createdAt)}
						</span>
						<span className='flex items-center gap-1'>
							<Clock className='h-3.5 w-3.5' />
							Last updated: {formatDate(post.updatedAt)}
						</span>
					</div>
				</DialogHeader>

				<Tabs defaultValue='details' className='p-6'>
					<TabsList className='mb-6 grid w-full grid-cols-2 bg-gray-800'>
						<TabsTrigger
							value='details'
							className='data-[state=active]:bg-gray-700 data-[state=active]:text-white'>
							Details
						</TabsTrigger>
						<TabsTrigger
							value='location'
							className='data-[state=active]:bg-gray-700 data-[state=active]:text-white'>
							Location
						</TabsTrigger>
					</TabsList>

					<TabsContent value='details' className='mt-0'>
						<div className='space-y-6'>
							{/* Post Status */}
							<div className='flex items-center gap-2'>
								<Badge
									className={` ${
										post.status === 'active'
											? 'bg-green-600 hover:bg-green-700'
											: post.status === 'maintenance'
												? 'bg-amber-600 hover:bg-amber-700'
												: 'bg-gray-600 hover:bg-gray-700'
									} `}>
									{post.status.toUpperCase()}
								</Badge>
							</div>

							{/* Available Services */}
							<div>
								<h3 className='mb-3 text-sm font-semibold text-gray-300'>
									Available Services
								</h3>
								<div className='flex flex-wrap gap-2'>
									{post.hasPoliceService && (
										<Badge className='bg-blue-600 hover:bg-blue-700'>
											Traffic Police
										</Badge>
									)}
									{post.hasAmbulance && (
										<Badge className='bg-green-600 hover:bg-green-700'>
											Ambulance
										</Badge>
									)}
									{post.hasFireService && (
										<Badge className='bg-red-600 hover:bg-red-700'>
											Fire Department
										</Badge>
									)}
									{!post.hasPoliceService &&
										!post.hasAmbulance &&
										!post.hasFireService && (
											<span className='text-gray-400'>
												No services available
											</span>
										)}
								</div>
							</div>

							{/* Address */}
							<div>
								<h3 className='mb-2 text-sm font-semibold text-gray-300'>
									Address
								</h3>
								<div className='rounded-md border border-gray-700 bg-gray-800 p-3 text-gray-300'>
									<div className='flex items-start gap-2'>
										<MapPin className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
										<span>{post.address}</span>
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div>
								<h3 className='mb-2 text-sm font-semibold text-gray-300'>
									Contact Information
								</h3>
								<div className='rounded-md border border-gray-700 bg-gray-800 p-3 text-gray-300'>
									<div className='flex items-center gap-2'>
										<Phone className='h-4 w-4 text-gray-400' />
										<span>{post.contactNumber}</span>
									</div>
								</div>
							</div>

							{/* Operating Hours */}
							<div>
								<h3 className='mb-2 text-sm font-semibold text-gray-300'>
									Operating Hours
								</h3>
								<div className='rounded-md border border-gray-700 bg-gray-800 p-3 text-gray-300'>
									<div className='flex items-center gap-2'>
										<Clock className='h-4 w-4 text-gray-400' />
										<span>{post.operatingHours}</span>
									</div>
								</div>
							</div>

							{/* Additional Information */}
							{post.additionalInfo && (
								<div>
									<h3 className='mb-2 text-sm font-semibold text-gray-300'>
										Additional Information
									</h3>
									<div className='rounded-md border border-gray-700 bg-gray-800 p-3 text-gray-300'>
										<p>{post.additionalInfo}</p>
									</div>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value='location' className='mt-0'>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div>
									<h3 className='text-sm font-semibold text-gray-300'>
										Location Coordinates
									</h3>
									<p className='text-sm text-gray-400'>
										Latitude: {post.latitude.toFixed(6)}, Longitude:{' '}
										{post.longitude.toFixed(6)}
									</p>
								</div>
								<Button
									variant='outline'
									size='sm'
									onClick={() =>
										window.open(
											`https://maps.google.com/?q=${post.latitude},${post.longitude}`,
											'_blank'
										)
									}
									className='gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'>
									<ExternalLink className='h-4 w-4' />
									Open in Google Maps
								</Button>
							</div>

							<div className='h-[400px] overflow-hidden rounded-lg border border-gray-700'>
								<MapComponent
									marker={{
										latitude: post.latitude,
										longitude: post.longitude,
									}}
									interactive={false}
								/>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
