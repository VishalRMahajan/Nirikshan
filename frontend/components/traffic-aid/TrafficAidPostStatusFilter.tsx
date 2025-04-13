import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Filter, X } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrafficAidPost, TrafficAidPostStatusFilterValue } from './types';

interface TrafficAidPostStatusFilterProps {
	table: Table<TrafficAidPost>;
}

const statusOptions = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
	{ value: 'maintenance', label: 'Maintenance' },
];

export function TrafficAidPostStatusFilter({
	table,
}: TrafficAidPostStatusFilterProps) {
	const statusColumn = table.getColumn('status');
	const statusFilter =
		statusColumn?.getFilterValue() as TrafficAidPostStatusFilterValue;

	const isFiltered = statusFilter && statusFilter.length > 0;

	// Function to toggle a status value in the filter array
	const toggleStatus = (value: string) => {
		if (!statusColumn) return;

		const currentFilter = statusFilter || [];

		if (currentFilter.includes(value)) {
			// If value exists, remove it
			statusColumn.setFilterValue(currentFilter.filter(item => item !== value));
		} else {
			// If value doesn't exist, add it
			statusColumn.setFilterValue([...currentFilter, value]);
		}
	};

	// Function to clear all status filters
	const clearFilter = () => {
		if (statusColumn) {
			statusColumn.setFilterValue([]);
		}
	};

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className={`h-9 gap-1 border-gray-700 bg-gray-800 hover:bg-gray-700 ${
						isFiltered
							? 'border-blue-600 bg-blue-900/20 text-blue-200'
							: 'text-gray-300'
					}`}>
					<Filter className='h-3.5 w-3.5' />
					<span>Status</span>
					{isFiltered && (
						<Badge
							variant='secondary'
							className='ml-1 rounded-full bg-blue-900 px-1 py-0 text-xs text-blue-200'>
							{statusFilter.length}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='start'
				className='w-[180px] border-gray-800 bg-gray-900 text-white'>
				{statusOptions.map(option => (
					<DropdownMenuCheckboxItem
						key={option.value}
						className='flex items-center gap-2 hover:bg-gray-800'
						checked={statusFilter?.includes(option.value)}
						onCheckedChange={() => toggleStatus(option.value)}>
						{statusFilter?.includes(option.value) && (
							<CheckSquare className='h-4 w-4 text-blue-500' />
						)}
						<span>{option.label}</span>
					</DropdownMenuCheckboxItem>
				))}
				{isFiltered && (
					<div className='border-t border-gray-800 p-1'>
						<Button
							variant='outline'
							size='sm'
							className='h-7 w-full gap-1 border-gray-700 bg-gray-800 text-xs text-gray-300 hover:bg-gray-700'
							onClick={clearFilter}>
							<X className='h-3 w-3' />
							Clear filters
						</Button>
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
