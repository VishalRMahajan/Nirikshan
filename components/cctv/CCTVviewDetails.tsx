import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { CCTV } from './types';
import { Badge } from '@/components/ui/badge';
import { Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Import map component with SSR disabled
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

type CCTVViewDetailsProps = {
	open: boolean;
	onClose: () => void;
	cctv: CCTV;
};

// Safe date formatting function
const formatDate = (dateString: string | Date | null | undefined) => {
	if (!dateString) return 'N/A';

	try {
		const date = new Date(dateString);
		// Check if date is valid
		if (isNaN(date.getTime())) {
			return 'Invalid date';
		}
		return date.toLocaleString();
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'Invalid date';
	}
};

export function CCTVViewDetails({ open, onClose, cctv }: CCTVViewDetailsProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl border-gray-700 bg-gray-900 text-white'>
				<DialogHeader>
					<DialogTitle className='text-xl font-semibold text-gray-100'>
						CCTV Details
					</DialogTitle>
				</DialogHeader>

				<div className='mt-4 grid grid-cols-1 gap-6 md:grid-cols-2'>
					{/* Left column with CCTV details */}
					<div className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<h3 className='text-sm font-medium text-gray-400'>Name</h3>
								<p className='mt-1 text-base'>{cctv.name}</p>
							</div>

							<div>
								<h3 className='text-sm font-medium text-gray-400'>Status</h3>
								<div className='mt-1'>
									<Badge
										variant={cctv.status === 'active' ? 'default' : 'secondary'}
										className='capitalize'>
										{cctv.status}
									</Badge>
								</div>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-medium text-gray-400'>RTSP URL</h3>
							<p className='mt-1 break-all rounded bg-gray-800 p-2 font-mono text-sm'>
								{cctv.rtspUrl}
							</p>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div>
								<h3 className='text-sm font-medium text-gray-400'>Latitude</h3>
								<p className='mt-1 font-mono'>{cctv.latitude.toFixed(6)}</p>
							</div>

							<div>
								<h3 className='text-sm font-medium text-gray-400'>Longitude</h3>
								<p className='mt-1 font-mono'>{cctv.longitude.toFixed(6)}</p>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-medium text-gray-400'>Created At</h3>
							<p className='mt-1'>{formatDate(cctv.createdAt)}</p>
						</div>

						<div>
							<h3 className='text-sm font-medium text-gray-400'>
								Accident Video
							</h3>
							<div className='mt-2'>
								{cctv.hasAccidentVideo && cctv.accidentVideoUrl ? (
									<div className='mt-2'>
										<video
											src={cctv.accidentVideoUrl}
											controls
											className='w-full rounded border border-gray-700'
										/>
									</div>
								) : (
									<p className='text-gray-500'>No accident video available</p>
								)}
							</div>
						</div>
					</div>

					{/* Right column with map */}
					<div className='flex flex-col'>
						<h3 className='mb-2 text-sm font-medium text-gray-400'>Location</h3>
						<div className='relative min-h-[260px] flex-1 overflow-hidden rounded-md border border-gray-700'>
							<MapComponent
								marker={{
									latitude: cctv.latitude,
									longitude: cctv.longitude,
								}}
								interactive={false}
								initialZoom={15}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
