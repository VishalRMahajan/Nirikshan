import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CCTVStatusFilter } from './CCTVStatusFilter';
import { CCTV } from './types';

interface CCTVTableHeaderProps {
	table: Table<CCTV>;
	loading: boolean;
	refreshData: () => void;
	openAddDialog: () => void;
	openDeleteDialog: () => void;
}

export function CCTVTableHeader({
	table,
	loading,
	refreshData,
	openAddDialog,
	openDeleteDialog,
}: CCTVTableHeaderProps) {
	return (
		<div className='bg-gray-850 flex flex-wrap items-center justify-between gap-3 rounded-t-md border border-gray-700 p-4'>
			<div className='flex flex-wrap items-center gap-3'>
				<div className='relative max-w-sm'>
					<Input
						placeholder='Search CCTV cameras...'
						value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
						onChange={event =>
							table.getColumn('name')?.setFilterValue(event.target.value)
						}
						className='border-gray-700 bg-gray-800 pl-9 text-white focus-visible:ring-blue-600'
					/>
					<div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'>
							<circle cx='11' cy='11' r='8'></circle>
							<path d='m21 21-4.3-4.3'></path>
						</svg>
					</div>
				</div>

				<CCTVStatusFilter table={table} />

				<Button
					variant='ghost'
					size='sm'
					onClick={refreshData}
					disabled={loading}
					className='h-9 text-gray-300 hover:bg-gray-700 hover:text-white'>
					<RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
				</Button>
			</div>

			<div className='flex space-x-2'>
				<Button
					onClick={openAddDialog}
					variant='default'
					className='bg-blue-600 text-white hover:bg-blue-700'>
					<Plus className='mr-0.5 h-2 w-4' />
					Add CCTV
				</Button>
				<Button
					onClick={openDeleteDialog}
					variant='destructive'
					disabled={table.getSelectedRowModel().rows.length === 0}
					className='bg-red-600 text-white hover:bg-red-700'>
					<Trash2 className='mr-0.5 h-4 w-4' />
					Delete Selected
				</Button>
			</div>
		</div>
	);
}
