import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { CCTV } from './types';

interface CCTVPaginationProps {
	table: Table<CCTV>;
}

export function CCTVPagination({ table }: CCTVPaginationProps) {
	if (table.getRowModel().rows?.length === 0) return null;

	return (
		<div className='bg-gray-850 flex items-center justify-between border-t border-gray-700 px-4 py-4'>
			<div className='text-sm text-gray-400'>
				Showing{' '}
				<span className='font-medium text-gray-200'>
					{table.getState().pagination.pageIndex *
						table.getState().pagination.pageSize +
						1}
				</span>{' '}
				to{' '}
				<span className='font-medium text-gray-200'>
					{Math.min(
						(table.getState().pagination.pageIndex + 1) *
							table.getState().pagination.pageSize,
						table.getFilteredRowModel().rows.length
					)}
				</span>{' '}
				of{' '}
				<span className='font-medium text-gray-200'>
					{table.getFilteredRowModel().rows.length}
				</span>{' '}
				cameras
			</div>
			<div className='flex items-center space-x-2'>
				<Button
					variant='outline'
					className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-white hover:bg-gray-700'
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}>
					<span className='sr-only'>Go to first page</span>
					<ChevronsLeft className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-white hover:bg-gray-700'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}>
					<span className='sr-only'>Go to previous page</span>
					<ChevronLeft className='h-4 w-4' />
				</Button>
				<div className='flex items-center text-sm text-gray-300'>
					Page{' '}
					<span className='mx-2 font-medium'>
						{table.getState().pagination.pageIndex + 1}
					</span>
					of <span className='ml-2 font-medium'>{table.getPageCount()}</span>
				</div>
				<Button
					variant='outline'
					className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-white hover:bg-gray-700'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}>
					<span className='sr-only'>Go to next page</span>
					<ChevronRight className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-white hover:bg-gray-700'
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}>
					<span className='sr-only'>Go to last page</span>
					<ChevronsRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}
