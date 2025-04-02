import React from 'react';

interface LoadingStateProps {
	itemCount?: number;
	type?: 'table' | 'cards' | 'details';
}

export function LoadingState({
	itemCount = 6,
	type = 'cards',
}: LoadingStateProps) {
	if (type === 'details') {
		return (
			<div className='space-y-4'>
				<div className='h-8 w-1/3 animate-pulse rounded-md bg-gray-800' />
				<div className='h-4 w-1/2 animate-pulse rounded-md bg-gray-800' />
				<div className='aspect-video w-full animate-pulse rounded-md bg-gray-800' />
				<div className='grid grid-cols-2 gap-4'>
					<div className='h-24 animate-pulse rounded-md bg-gray-800' />
					<div className='h-24 animate-pulse rounded-md bg-gray-800' />
				</div>
				<div className='h-36 animate-pulse rounded-md bg-gray-800' />
			</div>
		);
	}

	if (type === 'table') {
		return (
			<div className='w-full space-y-4 rounded-md border border-gray-700'>
				<div className='h-12 w-full animate-pulse bg-gray-800' />
				{Array.from({ length: itemCount }).map((_, i) => (
					<div
						key={i}
						className='h-16 w-full animate-pulse border-t border-gray-700 bg-gray-800'
					/>
				))}
			</div>
		);
	}

	// Default: cards
	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{Array.from({ length: itemCount }).map((_, i) => (
				<div key={i} className='h-40 animate-pulse rounded-md bg-gray-800' />
			))}
		</div>
	);
}
