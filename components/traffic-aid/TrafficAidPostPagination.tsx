import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react';
import { TrafficAidPost } from './types';

interface TrafficAidPostPaginationProps {
	table: Table<TrafficAidPost>;
}

export function TrafficAidPostPagination({
	table,
}: TrafficAidPostPaginationProps) {
	return (
		<div className='flex items-center justify-between border-t border-gray-700 px-4 py-4'>
			<div className='flex items-center gap-2 text-sm text-gray-400'>
				<div>Rows per page:</div>
				<Select
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={value => {
						table.setPageSize(Number(value));
					}}>
					<SelectTrigger className='h-8 w-[70px] border-gray-700 bg-gray-800 text-white'>
						<SelectValue placeholder={table.getState().pagination.pageSize} />
					</SelectTrigger>
					<SelectContent
						side='top'
						className='border-gray-700 bg-gray-900 text-white'>
						{[5, 10, 20, 30, 40, 50].map(pageSize => (
							<SelectItem
								key={pageSize}
								value={`${pageSize}`}
								className='hover:bg-gray-800'>
								{pageSize}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='flex items-center space-x-6 lg:space-x-8'>
				<div className='flex w-[100px] items-center justify-center text-sm text-gray-400'>
					Page {table.getState().pagination.pageIndex + 1} of{' '}
					{table.getPageCount()}
				</div>
				<div className='flex items-center space-x-2'>
					<Button
						variant='outline'
						className='hidden h-8 w-8 border-gray-700 bg-gray-800 p-0 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 lg:flex'
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}>
						<span className='sr-only'>Go to first page</span>
						<ChevronsLeft className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						<span className='sr-only'>Go to previous page</span>
						<ChevronLeft className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='h-8 w-8 border-gray-700 bg-gray-800 p-0 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						<span className='sr-only'>Go to next page</span>
						<ChevronRight className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='hidden h-8 w-8 border-gray-700 bg-gray-800 p-0 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 lg:flex'
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}>
						<span className='sr-only'>Go to last page</span>
						<ChevronsRight className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}
