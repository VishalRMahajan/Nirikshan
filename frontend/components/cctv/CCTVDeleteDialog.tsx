import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CCTV } from './types';

interface CCTVDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rowsToDelete: CCTV[];
	onDelete: () => Promise<void>;
	loading: boolean;
}

export function CCTVDeleteDialog({
	open,
	onOpenChange,
	rowsToDelete,
	onDelete,
	loading,
}: CCTVDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='border-gray-700 bg-gray-900 text-white'>
				<DialogHeader>
					<DialogTitle className='text-xl font-semibold text-gray-100'>
						Confirm Deletion
					</DialogTitle>
				</DialogHeader>
				<div className='py-4'>
					<p className='text-gray-300'>
						Are you sure you want to delete {rowsToDelete.length} selected CCTV{' '}
						{rowsToDelete.length > 1 ? 'cameras' : 'camera'}?
					</p>
					<div className='mt-4 max-h-32 overflow-auto rounded-md border border-gray-700 bg-gray-800 p-3'>
						{rowsToDelete.map(cctv => (
							<div key={cctv.id} className='flex items-center py-1'>
								<div className='mr-2 h-2 w-2 rounded-full bg-red-500' />
								<span className='text-sm text-gray-300'>{cctv.name}</span>
							</div>
						))}
					</div>
					<p className='mt-4 text-sm text-amber-400'>
						Warning: This action cannot be undone.
					</p>
				</div>
				<DialogFooter className='border-t border-gray-700 pt-4'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={onDelete}
						disabled={loading}
						className='bg-red-600 text-white hover:bg-red-700'>
						{loading ? (
							<>
								<svg
									className='-ml-1 mr-2 h-4 w-4 animate-spin text-white'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
								</svg>
								Processing...
							</>
						) : (
							<>Delete {rowsToDelete.length > 1 ? 'Cameras' : 'Camera'}</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
