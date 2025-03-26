'use client';

import * as React from 'react';
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { AddCCTVDialog } from '@/components/add-cctv-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
	ArrowUpDown,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Copy,
	Filter,
	MoreHorizontal,
	Plus,
	RefreshCw,
	Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CCTV = {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	rtspUrl: string;
	status: string;
	createdAt: string;
};

export const columns: ColumnDef<CCTV>[] = [
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
					<div className='truncate font-mono text-xs text-gray-300'>{url}</div>
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
			const date = new Date(row.getValue<string>('createdAt'));
			return (
				<div className='text-sm text-gray-300'>
					<div>{date.toLocaleDateString()}</div>
					<div className='text-xs text-gray-400'>
						{date.toLocaleTimeString()}
					</div>
				</div>
			);
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const cctv = row.original;
			return (
				<DropdownMenu>
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
						<DropdownMenuItem className='cursor-pointer hover:bg-gray-700'>
							View details
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer hover:bg-gray-700'>
							Edit CCTV
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer text-red-500 hover:bg-gray-700 hover:text-red-400 focus:text-red-400'>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export function CCTVTable() {
	const { toast } = useToast();
	const [data, setData] = React.useState<CCTV[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
	const [rowsToDelete, setRowsToDelete] = React.useState<CCTV[]>([]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [refreshKey, setRefreshKey] = React.useState(0);

	// Fetch data from the API
	React.useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/cctvs');

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const result = await response.json();
				setData(result);
			} catch (error) {
				console.error('Error fetching CCTV data:', error);
				toast({
					title: 'Error fetching data',
					description: (error as Error).message || 'Could not load CCTV data',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [toast, refreshKey]);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	const handleAddCCTV = async (newCCTV: {
		name: string;
		rtspUrl: string;
		latitude: number;
		longitude: number;
		status: string;
	}) => {
		try {
			const response = await fetch('/api/cctvs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newCCTV),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const createdCCTV = await response.json();

			setData(prevData => [...prevData, createdCCTV]);
			toast({
				title: 'CCTV Added',
				description: `${newCCTV.name} has been successfully added.`,
			});
		} catch (error) {
			console.error('Error adding CCTV:', error);
			toast({
				title: 'Error adding CCTV',
				description: (error as Error).message || 'Failed to add CCTV',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteCCTV = async () => {
		if (rowsToDelete.length === 0) return;

		try {
			setLoading(true);
			for (const row of rowsToDelete) {
				const response = await fetch(`/api/cctvs/${row.id}`, {
					method: 'DELETE',
				});

				if (!response.ok) {
					throw new Error(
						`API error when deleting ${row.name}: ${response.status}`
					);
				}
			}

			const remainingData = data.filter(
				cctv => !rowsToDelete.some(row => row.id === cctv.id)
			);
			setData(remainingData);

			toast({
				title: 'Successfully deleted',
				description: `${rowsToDelete.length} CCTV ${rowsToDelete.length > 1 ? 'cameras' : 'camera'} removed.`,
			});

			// Reset row selection
			setRowSelection({});
		} catch (error) {
			console.error('Error deleting CCTV(s):', error);
			toast({
				title: 'Error deleting CCTV',
				description:
					(error as Error).message || 'Failed to delete selected cameras',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
			setIsDialogOpen(false);
			setRowsToDelete([]);
		}
	};

	const refreshData = () => {
		setRefreshKey(prev => prev + 1);
	};

	const openDeleteDialog = () => {
		const selectedRows = table
			.getSelectedRowModel()
			.rows.map(row => row.original);

		if (selectedRows.length === 0) {
			toast({
				description: 'Please select at least one CCTV to delete.',
			});
			return;
		}

		setRowsToDelete(selectedRows);
		setIsDialogOpen(true);
	};

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
		<div className='w-full'>
			{/* Header toolbar */}
			<div className='bg-gray-850 flex flex-wrap items-center justify-between gap-3 rounded-t-md border border-gray-700 p-4'>
				<div className='flex flex-wrap items-center gap-3'>
					<div className='relative max-w-sm'>
						<Input
							placeholder='Search CCTV cameras...'
							value={
								(table.getColumn('name')?.getFilterValue() as string) ?? ''
							}
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

					<DropdownMenu>
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
										(table.getColumn('status')?.getFilterValue() as string[]) ||
										[]
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
										(table.getColumn('status')?.getFilterValue() as string[]) ||
										[]
									).includes('inactive')}
									className='mr-2 rounded-sm'
								/>
								Inactive
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant='ghost'
						size='sm'
						onClick={refreshData}
						disabled={loading}
						className='h-9 text-gray-300 hover:bg-gray-700 hover:text-white'>
						<RefreshCw
							className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
						/>
						Refresh
					</Button>
				</div>

				<div className='flex space-x-2'>
					<Button
						onClick={() => setIsAddDialogOpen(true)}
						variant='default'
						className='bg-blue-600 text-white hover:bg-blue-700'>
						<Plus className='mr-2 h-4 w-4' />
						Add CCTV
					</Button>
					<Button
						onClick={openDeleteDialog}
						variant='destructive'
						disabled={table.getSelectedRowModel().rows.length === 0}
						className='bg-red-600 text-white hover:bg-red-700'>
						<Trash2 className='mr-2 h-4 w-4' />
						Delete Selected
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className='overflow-hidden rounded-b-md border border-t-0 border-gray-700'>
				{loading ? (
					<div className='flex h-96 flex-col items-center justify-center bg-gray-900'>
						<div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500'></div>
						<p className='text-gray-400'>Loading CCTV data...</p>
					</div>
				) : (
					<>
						<div className='relative overflow-x-auto'>
							<Table className='border-collapse'>
								<TableHeader className='bg-gray-850'>
									{table.getHeaderGroups().map(headerGroup => (
										<TableRow
											key={headerGroup.id}
											className='border-b border-gray-700'>
											{headerGroup.headers.map(header => (
												<TableHead
													key={header.id}
													className='py-4 font-semibold text-gray-300 first:pl-6 last:pr-6'>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map(row => (
											<TableRow
												key={row.id}
												className={cn(
													'border-b border-gray-800 transition-colors hover:bg-gray-800/50',
													row.getIsSelected() && 'bg-gray-800/70'
												)}
												data-state={row.getIsSelected() && 'selected'}>
												{row.getVisibleCells().map(cell => (
													<TableCell
														key={cell.id}
														className='py-3 first:pl-6 last:pr-6'>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className='h-96 bg-gray-900 text-center'>
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
													<p className='mb-2 text-gray-400'>
														No CCTV cameras found
													</p>
													<p className='mb-5 text-sm text-gray-500'>
														Add a new camera to start monitoring
													</p>
													<Button
														onClick={() => setIsAddDialogOpen(true)}
														variant='default'
														className='bg-blue-600 text-white hover:bg-blue-700'>
														<Plus />
														Add CCTV
													</Button>
												</div>
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination Controls */}
						{table.getRowModel().rows?.length > 0 && (
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
										of{' '}
										<span className='ml-2 font-medium'>
											{table.getPageCount()}
										</span>
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
						)}
					</>
				)}
			</div>

			{/* Add CCTV Dialog */}
			<AddCCTVDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				onAddCCTV={handleAddCCTV}
			/>

			{/* Dialog for Deletion Confirmation */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='border-gray-700 bg-gray-900 text-white'>
					<DialogHeader>
						<DialogTitle className='text-xl font-semibold text-gray-100'>
							Confirm Deletion
						</DialogTitle>
					</DialogHeader>
					<div className='py-4'>
						<p className='text-gray-300'>
							Are you sure you want to delete {rowsToDelete.length} selected
							CCTV {rowsToDelete.length > 1 ? 'cameras' : 'camera'}?
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
							onClick={() => setIsDialogOpen(false)}
							className='border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'>
							Cancel
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteCCTV}
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
		</div>
	);
}
