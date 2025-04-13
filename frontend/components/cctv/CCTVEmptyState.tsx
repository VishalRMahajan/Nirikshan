import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CCTVEmptyStateProps {
	openAddDialog: () => void;
	columns: number;
}

export function CCTVEmptyState({
	openAddDialog,
	columns,
}: CCTVEmptyStateProps) {
	return (
		<td colSpan={columns} className='h-96 bg-gray-900 text-center'>
			<div className='flex flex-col items-center justify-center p-6'>
				<div className='mb-4 rounded-full bg-gray-800 p-3'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='text-gray-500'>
						<path d='M18 6 6 18'></path>
						<path d='m6 6 12 12'></path>
					</svg>
				</div>
				<p className='mb-2 text-gray-400'>No CCTV cameras found</p>
				<p className='mb-5 text-sm text-gray-500'>
					Add a new camera to start monitoring
				</p>
				<Button
					onClick={openAddDialog}
					variant='default'
					className='bg-blue-600 text-white hover:bg-blue-700'>
					<Plus className='mr-2 h-4 w-4' />
					Add CCTV
				</Button>
			</div>
		</td>
	);
}
