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
import { ArrowUpDown, Phone, MoreHorizontal, Map } from 'lucide-react';
import { TrafficAidPost } from './types';
import { TrafficAidPostViewDetails } from './TrafficAidPostViewDetails';
import { EditTrafficAidPostDialog } from './EditTrafficAidPostDialog';

export const createColumns = (): ColumnDef<TrafficAidPost>[] => {
	const handleEditPost = async (
		id: string,
		data: {
			name: string;
			address: string;
			latitude: number;
			longitude: number;
			contactNumber: string;
			hasPoliceService: boolean;
			hasAmbulance: boolean;
			hasFireService: boolean;
			operatingHours: string;
			status: string;
			additionalInfo?: string;
		}
	) => {
		try {
			const response = await fetch(`/api/trafficaid/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update traffic aid post');
			}

			// Force reload to display the updated data
			window.location.reload();
		} catch (error) {
			console.error('Error updating traffic aid post:', error);
			alert(
				error instanceof Error
					? error.message
					: 'Failed to update traffic aid post'
			);
		}
	};

	const formatDate = (dateString: string | Date | null) => {
		if (!dateString) return 'N/A';

		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}
			return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
		} catch {
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
					onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
					aria-label='Select all'
					className='border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
					aria-label='Select row'
					className='border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
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
			accessorKey: 'address',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Address</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => (
				<div className='max-w-[250px] truncate' title={row.getValue('address')}>
					{row.getValue('address')}
				</div>
			),
		},
		{
			accessorKey: 'contactNumber',
			header: ({ column }) => (
				<div
					className='flex cursor-pointer items-center space-x-1'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					<span>Contact</span>
					<ArrowUpDown className='h-4 w-4 text-gray-400' />
				</div>
			),
			cell: ({ row }) => (
				<div className='flex items-center'>
					<Phone className='mr-2 h-3.5 w-3.5 text-gray-400' />
					<span>{row.getValue('contactNumber')}</span>
				</div>
			),
		},
		{
			accessorKey: 'services',
			header: 'Available Services',
			cell: ({ row }) => {
				const post = row.original;
				return (
					<div className='flex flex-wrap gap-1'>
						{post.hasPoliceService && (
							<Badge className='bg-blue-600'>Police</Badge>
						)}
						{post.hasAmbulance && (
							<Badge className='bg-green-600'>Ambulance</Badge>
						)}
						{post.hasFireService && <Badge className='bg-red-600'>Fire</Badge>}
						{!post.hasPoliceService &&
							!post.hasAmbulance &&
							!post.hasFireService && (
								<span className='text-sm text-gray-400'>None</span>
							)}
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
						variant={
							status === 'active'
								? 'default'
								: status === 'inactive'
									? 'secondary'
									: 'destructive'
						}
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
					<div className='text-sm text-gray-400'>
						{formatDate(rawDate as string)}
					</div>
				);
			},
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const post = row.original;
				const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false);
				const [editDialogOpen, setEditDialogOpen] = React.useState(false);

				return (
					<>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='h-8 w-8 p-0 data-[state=open]:bg-gray-700'>
									<span className='sr-only'>Open menu</span>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-[160px] border-gray-800 bg-gray-900 text-white'>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuSeparator className='bg-gray-800' />
								<DropdownMenuItem
									className='cursor-pointer hover:bg-gray-700'
									onClick={() => setViewDetailsOpen(true)}>
									View details
								</DropdownMenuItem>
								<DropdownMenuItem
									className='cursor-pointer hover:bg-gray-700'
									onClick={() => setEditDialogOpen(true)}>
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									className='cursor-pointer hover:bg-gray-700'
									onClick={() =>
										window.open(
											`https://maps.google.com/?q=${post.latitude},${post.longitude}`,
											'_blank'
										)
									}>
									<Map className='mr-2 h-4 w-4' />
									View on map
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<EditTrafficAidPostDialog
							open={editDialogOpen}
							onClose={() => setEditDialogOpen(false)}
							post={post}
							onEditPost={handleEditPost}
						/>
						<TrafficAidPostViewDetails
							open={viewDetailsOpen}
							onClose={() => setViewDetailsOpen(false)}
							post={post}
						/>
					</>
				);
			},
		},
	];
};
