import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Copy, Film, MoreHorizontal, Play } from 'lucide-react';
import { CCTV } from './types';

import { CCTVViewDetails } from './CCTVviewDetails';
import { EditCCTVDialog } from './CCTVEdit';

export const createColumns = (): ColumnDef<CCTV>[] => {
	// Replace the existing handleEditCCTV function with this version
	const handleEditCCTV = async (
		id: string,
		data: {
			name: string;
			rtspUrl: string;
			latitude: number;
			longitude: number;
			status: string;
			accidentVideo?: File | null;
			removeExistingVideo?: boolean;
		}
	) => {
		try {
			const { accidentVideo, removeExistingVideo, ...jsonData } = data;

			// Use FormData for multipart/form-data if there's a file, otherwise use JSON
			if (accidentVideo || removeExistingVideo) {
				const formData = new FormData();
				formData.append('name', jsonData.name);
				formData.append('rtspUrl', jsonData.rtspUrl);
				formData.append('latitude', jsonData.latitude.toString());
				formData.append('longitude', jsonData.longitude.toString());
				formData.append('status', jsonData.status);

				if (removeExistingVideo) {
					formData.append('removeExistingVideo', 'true');
				}

				if (accidentVideo) {
					formData.append('accidentVideo', accidentVideo);
				}

				const response = await fetch(`/api/cctvs/${id}`, {
					method: 'PATCH',
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update CCTV');
				}

				// Force reload to display the updated data
				window.location.reload();
			} else {
				// Use JSON for simpler updates without files
				const response = await fetch(`/api/cctvs/${id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(jsonData),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Failed to update CCTV');
				}
			}
		} catch (error) {
			console.error('Error updating CCTV:', error);
			alert(error instanceof Error ? error.message : 'Failed to update CCTV');
		}
	};

	const formatDate = (dateString: string | Date | null) => {
		if (!dateString) return 'N/A';

		try {
			const date = new Date(dateString);
			// Check if date is valid
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}
			return date.toLocaleString();
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Invalid date';
		}
	};

	return [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={(value: boolean) =>
						table.toggleAllPageRowsSelected(value)
					}
					aria-label='Select all'
					className='rounded-sm'
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value: boolean) => row.toggleSelected(value)}
					aria-label='Select row'
					className='rounded-sm'
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: 'name',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Name</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => (
				<div className='font-medium'>{row.getValue('name')}</div>
			),
		},
		{
			accessorKey: 'latitude',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Latitude</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => (
				<div className='font-mono text-sm'>
					{row.getValue<number>('latitude').toFixed(6)}
				</div>
			),
		},
		{
			accessorKey: 'longitude',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Longitude</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => (
				<div className='font-mono text-sm'>
					{row.getValue<number>('longitude').toFixed(6)}
				</div>
			),
		},
		{
			accessorKey: 'rtspUrl',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>RTSP URL</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => {
				const url = row.getValue<string>('rtspUrl');
				return (
					<div className='group flex max-w-[300px] items-center'>
						<div className='truncate font-mono text-xs text-gray-300'>
							{url}
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='ml-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
							onClick={() => navigator.clipboard.writeText(url)}>
							<Copy className='h-3.5 w-3.5' />
						</Button>
					</div>
				);
			},
		},
		{
			accessorKey: 'status',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Status</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => {
				const status = row.getValue<string>('status');
				return (
					<Badge
						variant={status === 'active' ? 'default' : 'secondary'}
						className='capitalize'>
						{status}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Created At</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => {
				const rawDate = row.getValue('createdAt');
				return (
					<div className='flex flex-col space-y-1'>
						<div>{formatDate(rawDate as string | Date | null)}</div>
					</div>
				);
			},
		},
		// Update this section only in your CCTVColumns.tsx file
		{
			accessorKey: 'hasAccidentVideo',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Accident Video</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => {
				const hasVideo = row.getValue<boolean | undefined>('hasAccidentVideo');
				const videoUrl = row.original.accidentVideoUrl;

				return (
					<div>
						{hasVideo && videoUrl ? (
							<div className='flex items-center'>
								<Button
									variant='ghost'
									size='sm'
									className='text-blue-500 hover:text-blue-400'
									onClick={() => window.open(videoUrl, '_blank')}>
									<Film className='mr-2 h-4 w-4' />
									<span>View Video</span>
								</Button>
							</div>
						) : (
							<span className='text-sm text-gray-500'>No video</span>
						)}
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id) ? 'hasVideo' : 'noVideo');
			},
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const cctv = row.original;
				const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false);
				const [editDialogOpen, setEditDialogOpen] = React.useState(false);

				return (
					<>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<MoreHorizontal className='h-4 w-4' />
									<span className='sr-only'>Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='end'
								className='w-[160px] border-gray-700 bg-gray-800 text-white'>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuSeparator className='bg-gray-700' />
								<DropdownMenuItem
									className='cursor-pointer hover:bg-gray-700'
									onClick={() => setViewDetailsOpen(true)}>
									View details
								</DropdownMenuItem>
								<DropdownMenuItem
									className='cursor-pointer hover:bg-gray-700'
									onClick={() => setEditDialogOpen(true)}>
									Edit CCTV
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<EditCCTVDialog
							open={editDialogOpen}
							onClose={() => setEditDialogOpen(false)}
							cctv={row.original}
							onEditCCTV={handleEditCCTV}
						/>
						<CCTVViewDetails
							open={viewDetailsOpen}
							onClose={() => setViewDetailsOpen(false)}
							cctv={cctv}
						/>
					</>
				);
			},
		},
	];
};
