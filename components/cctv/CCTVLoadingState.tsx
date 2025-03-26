import * as React from 'react';

export function CCTVLoadingState() {
	return (
		<div className='flex h-96 flex-col items-center justify-center bg-gray-900'>
			<div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500'></div>
			<p className='text-gray-400'>Loading CCTV data...</p>
		</div>
	);
}
