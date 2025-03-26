import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CCTV } from './types';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

interface CCTVViewDetailsProps {
	open: boolean;
	onClose: () => void;
	cctv: CCTV | null;
}

export function CCTVViewDetails({ open, onClose, cctv }: CCTVViewDetailsProps) {
	if (!cctv) return null;

	const handleCopyRtspUrl = () => {
		navigator.clipboard.writeText(cctv.rtspUrl);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short',
		}).format(date);
	};

	const handleDialogClose = () => {
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleDialogClose}>
			<DialogContent className='w-full max-w-3xl border-gray-700 bg-gray-900 p-0 text-white'>
				<DialogHeader className='border-b border-gray-700 p-5'>
					<div className='space-y-2'>
						<DialogTitle className='flex items-center text-xl font-semibold text-gray-100'>
							<MapPin className='mr-2 h-5 w-5 text-blue-500' />
							{cctv.name}
						</DialogTitle>
						<div className='flex gap-2'>
							<Badge
								variant={cctv.status === 'active' ? 'default' : 'secondary'}
								className='inline-flex h-6 items-center capitalize'>
								{cctv.status}
							</Badge>
						</div>
					</div>
				</DialogHeader>

				<div className='grid grid-cols-1 gap-6 p-5 md:grid-cols-2'>
					{/* Left column - Details */}
					<div className='space-y-5'>
						<div>
							<h3 className='mb-2 text-sm font-medium text-gray-400'>
								RTSP Stream URL
							</h3>
							<div className='group flex items-center rounded-md bg-gray-800 p-2'>
								<div className='flex-1 overflow-hidden truncate font-mono text-xs text-gray-300'>
									{cctv.rtspUrl}
								</div>
								<Button
									variant='ghost'
									size='icon'
									className='ml-1 h-7 w-7 shrink-0'
									onClick={handleCopyRtspUrl}>
									<Copy className='h-3.5 w-3.5' />
								</Button>
							</div>
						</div>

						<div>
							<h3 className='mb-2 text-sm font-medium text-gray-400'>
								Coordinates
							</h3>
							<div className='grid grid-cols-2 gap-3'>
								<div className='rounded-md bg-gray-800 p-3'>
									<div className='mb-1 text-xs text-gray-400'>Latitude</div>
									<div className='font-mono text-sm'>
										{cctv.latitude.toFixed(6)}
									</div>
								</div>
								<div className='rounded-md bg-gray-800 p-3'>
									<div className='mb-1 text-xs text-gray-400'>Longitude</div>
									<div className='font-mono text-sm'>
										{cctv.longitude.toFixed(6)}
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 className='mb-2 text-sm font-medium text-gray-400'>
								Added On
							</h3>
							<div className='rounded-md bg-gray-800 p-3'>
								<div className='text-sm'>{formatDate(cctv.createdAt)}</div>
							</div>
						</div>

						<div>
							<h3 className='mb-2 text-sm font-medium text-gray-400'>
								Camera ID
							</h3>
							<div className='rounded-md bg-gray-800 p-3'>
								<div className='select-all font-mono text-xs text-gray-300'>
									{cctv.id}
								</div>
							</div>
						</div>
					</div>

					{/* Right column - Map */}
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
						<div className='mt-4'>
							<Button
								variant='outline'
								size='sm'
								className='w-full border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700'
								onClick={() =>
									window.open(
										`https://www.google.com/maps?q=${cctv.latitude},${cctv.longitude}`,
										'_blank'
									)
								}>
								<ExternalLink className='mr-1.5 h-3.5 w-3.5' />
								View in Google Maps
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
