import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Filter } from 'lucide-react';
import { CCTV, CCTVStatusFilterValue } from './types';

interface CCTVStatusFilterProps {
	table: Table<CCTV>;
}

export function CCTVStatusFilter({ table }: CCTVStatusFilterProps) {
	const handleToggleStatusFilter = (status: string) => {
		const filterValue =
			(table.getColumn('status')?.getFilterValue() as string[]) || [];

		if (filterValue.includes(status)) {
			table
				.getColumn('status')
				?.setFilterValue(filterValue.filter(item => item !== status));
		} else {
			table.getColumn('status')?.setFilterValue([...filterValue, status]);
		}
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='h-9 border-gray-700 bg-gray-800 text-white hover:bg-gray-700'>
					<Filter className='mr-2 h-4 w-4' />
					Status Filter
					<ChevronDown className='ml-2 h-4 w-4 text-gray-400' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='border-gray-700 bg-gray-800 text-white'>
				<DropdownMenuLabel>Filter by status</DropdownMenuLabel>
				<DropdownMenuSeparator className='bg-gray-700' />
				<DropdownMenuItem
					className='flex cursor-pointer items-center hover:bg-gray-700'
					onClick={() => handleToggleStatusFilter('active')}>
					<Checkbox
						checked={(
							(table.getColumn('status')?.getFilterValue() as string[]) || []
						).includes('active')}
						className='mr-2 rounded-sm'
					/>
					Active
				</DropdownMenuItem>
				<DropdownMenuItem
					className='flex cursor-pointer items-center hover:bg-gray-700'
					onClick={() => handleToggleStatusFilter('inactive')}>
					<Checkbox
						checked={(
							(table.getColumn('status')?.getFilterValue() as string[]) || []
						).includes('inactive')}
						className='mr-2 rounded-sm'
					/>
					Inactive
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
