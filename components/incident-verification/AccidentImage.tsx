'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AccidentImageProps {
	imageUrl: string;
	alt?: string;
	className?: string;
}

export function AccidentImage({
	imageUrl,
	alt = 'Accident image',
	className = '',
}: AccidentImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isZoomed, setIsZoomed] = useState(false);

	// Normalize URL for proper display
	const processedUrl = React.useMemo(() => {
		if (!imageUrl) return '';

		// If it's already an absolute URL, use it
		if (imageUrl.startsWith('http')) return imageUrl;

		// Make sure relative URLs start with "/"
		return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
	}, [imageUrl]);

	const handleImageLoad = () => {
		setIsLoading(false);
		setError(null);
	};

	const handleImageError = () => {
		setIsLoading(false);
		setError('Failed to load accident image');
	};

	const handleDownload = () => {
		const link = document.createElement('a');
		link.href = processedUrl;
		link.download = processedUrl.split('/').pop() || 'accident.jpg';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<>
			<div
				className={`relative aspect-video w-full overflow-hidden rounded-md bg-black ${className}`}>
				{isLoading && (
					<div className='absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50'>
						<Loader2 className='h-10 w-10 animate-spin text-blue-500' />
					</div>
				)}

				{error && (
					<div className='absolute inset-0 z-20 flex flex-col items-center justify-center bg-black bg-opacity-75 p-4'>
						<AlertCircle className='mb-2 h-10 w-10 text-red-500' />
						<p className='mb-4 text-center text-white'>{error}</p>
					</div>
				)}

				{processedUrl && (
					<div className='relative h-full w-full'>
						<Image
							src={processedUrl}
							alt={alt}
							fill
							className='object-contain'
							onLoadingComplete={handleImageLoad}
							onError={handleImageError}
						/>

						<div className='absolute bottom-4 right-4 flex gap-2'>
							<Button
								size='sm'
								variant='secondary'
								className='bg-black/50 hover:bg-black/70'
								onClick={() => setIsZoomed(true)}>
								<ZoomIn className='h-4 w-4' />
							</Button>
							<Button
								size='sm'
								variant='secondary'
								className='bg-black/50 hover:bg-black/70'
								onClick={handleDownload}>
								<Download className='h-4 w-4' />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Zoom Dialog */}
			<Dialog open={isZoomed} onOpenChange={setIsZoomed}>
				<DialogContent className='max-h-[90vh] max-w-[90vw] bg-black p-0'>
					<div className='relative h-[80vh]'>
						<Image
							src={processedUrl}
							alt={alt}
							fill
							className='object-contain'
						/>
						<Button
							variant='secondary'
							size='sm'
							className='absolute right-4 top-4 bg-black/50 hover:bg-black/70'
							onClick={() => setIsZoomed(false)}>
							<ZoomOut className='mr-2 h-4 w-4' />
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
