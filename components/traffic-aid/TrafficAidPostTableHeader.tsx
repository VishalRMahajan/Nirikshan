import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	ChevronDown,
	Loader2,
	PlusCircle,
	RefreshCw,
	Search,
	Trash2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrafficAidPost } from './types';
import { TrafficAidPostStatusFilter } from './TrafficAidPostStatusFilter';

interface TrafficAidPostTableHeaderProps {
	table: Table<TrafficAidPost>;
	loading: boolean;
	refreshData: () => void;
	openAddDialog: () => void;
	openDeleteDialog: () => void;
}

export function TrafficAidPostTableHeader({
	table,
	loading,
	refreshData,
	openAddDialog,
	openDeleteDialog,
}: TrafficAidPostTableHeaderProps) {
	return (
		<div className='bg-gray-850 rounded-t-md border border-b-0 border-gray-700 p-4'>
			<div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
				<div className='flex items-center gap-3'>
					<div className='relative w-full max-w-[280px]'>
						<Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500' />
						<Input
							placeholder='Search aid posts...'
							value={
								(table.getColumn('name')?.getFilterValue() as string) ?? ''
							}
							onChange={event =>
								table.getColumn('name')?.setFilterValue(event.target.value)
							}
							className='border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
						/>
					</div>

					<TrafficAidPostStatusFilter table={table} />
				</div>

				<div className='flex items-center space-x-2'>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								size='sm'
								className='ml-auto flex h-8 gap-1 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'>
								<span>View</span>
								<ChevronDown className='h-4 w-4 opacity-50' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='border-gray-800 bg-gray-900 text-white'>
							{table
								.getAllColumns()
								.filter(column => column.getCanHide())
								.map(column => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='hover:bg-gray-800'
											checked={column.getIsVisible()}
											onCheckedChange={value =>
												column.toggleVisibility(!!value)
											}>
											{column.id === 'services'
												? 'Services'
												: column.id.charAt(0).toUpperCase() +
													column.id.slice(1)}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant='outline'
						size='sm'
						onClick={refreshData}
						disabled={loading}
						className='h-8 gap-1 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<RefreshCw className='h-4 w-4' />
						)}
						<span>Refresh</span>
					</Button>

					<Button
						variant='outline'
						size='sm'
						onClick={openDeleteDialog}
						className='h-8 gap-1 border-red-800 bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200'>
						<Trash2 className='h-4 w-4' />
						<span>Delete</span>
					</Button>

					<Button
						onClick={openAddDialog}
						size='sm'
						className='h-8 gap-1 bg-blue-600 hover:bg-blue-700'>
						<PlusCircle className='h-4 w-4' />
						<span>Add Post</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
