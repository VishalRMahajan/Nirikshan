'use client';

import * as React from 'react';
import {
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TrafficAidPost } from './types';
import { createColumns } from './TrafficAidPostColumns';
import { TrafficAidPostTableHeader } from './TrafficAidPostTableHeader';
import { TrafficAidPostLoadingState } from './TrafficAidPostLoadingState';
import { TrafficAidPostEmptyState } from './TrafficAidPostEmptyState';
import { TrafficAidPostPagination } from './TrafficAidPostPagination';
import { TrafficAidPostDeleteDialog } from './TrafficAidPostDeleteDialog';
import { AddTrafficAidPostDialog } from './AddTrafficAidPostDialog';

export function TrafficAidPostTable() {
	const { toast } = useToast();
	const [data, setData] = React.useState<TrafficAidPost[]>([]);
	const [loading, setLoading] = React.useState<boolean>(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
	const [postsToDelete, setPostsToDelete] = React.useState<TrafficAidPost[]>(
		[]
	);
	const [rowSelection, setRowSelection] = React.useState({});
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [refreshKey, setRefreshKey] = React.useState(0);

	const columns = React.useMemo(() => createColumns(), []);

	React.useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const response = await fetch('/api/trafficaid');

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const result = await response.json();
				setData(result);
			} catch (error) {
				console.error('Error fetching traffic aid post data:', error);
				toast({
					title: 'Error fetching data',
					description:
						(error as Error).message || 'Could not load traffic aid post data',
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

	const handleAddPost = async (newPost: {
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
	}) => {
		try {
			const response = await fetch('/api/trafficaid', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newPost),
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const createdPost = await response.json();

			setData(prevData => [...prevData, createdPost]);
			toast({
				title: 'Traffic Aid Post Added',
				description: `${newPost.name} has been successfully added.`,
			});
		} catch (error) {
			console.error('Error adding traffic aid post:', error);
			toast({
				title: 'Error adding traffic aid post',
				description:
					(error as Error).message || 'Failed to add traffic aid post',
				variant: 'destructive',
			});
		}
	};

	const handleDeletePost = async () => {
		if (postsToDelete.length === 0) return;

		try {
			setLoading(true);
			for (const post of postsToDelete) {
				const response = await fetch(`/api/trafficaid/${post.id}`, {
					method: 'DELETE',
				});

				if (!response.ok) {
					throw new Error(
						`API error when deleting ${post.name}: ${response.status}`
					);
				}
			}

			const remainingData = data.filter(
				post => !postsToDelete.some(row => row.id === post.id)
			);
			setData(remainingData);

			toast({
				title: 'Successfully deleted',
				description: `${postsToDelete.length} aid ${postsToDelete.length > 1 ? 'posts' : 'post'} removed.`,
			});

			setRowSelection({});
		} catch (error) {
			console.error('Error deleting traffic aid post(s):', error);
			toast({
				title: 'Error deleting traffic aid post',
				description:
					(error as Error).message || 'Failed to delete selected posts',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
			setIsDialogOpen(false);
			setPostsToDelete([]);
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
				description: 'Please select at least one traffic aid post to delete.',
			});
			return;
		}

		setPostsToDelete(selectedRows);
		setIsDialogOpen(true);
	};

	return (
		<div className='w-full'>
			<TrafficAidPostTableHeader
				table={table}
				loading={loading}
				refreshData={refreshData}
				openAddDialog={() => setIsAddDialogOpen(true)}
				openDeleteDialog={openDeleteDialog}
			/>

			{/* Table */}
			<div className='overflow-hidden rounded-b-md border border-t-0 border-gray-700'>
				{loading ? (
					<TrafficAidPostLoadingState />
				) : (
					<>
						<div className='relative overflow-x-auto'>
							<Table className='border-collapse'>
								<TableHeader className='bg-gray-850'>
									{table.getHeaderGroups().map(headerGroup => (
										<TableRow
											key={headerGroup.id}
											className='border-gray-700 hover:bg-transparent'>
											{headerGroup.headers.map(header => (
												<TableHead
													key={header.id}
													className='h-10 border-b border-gray-700 text-gray-400'>
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
													'border-gray-700 data-[state=selected]:bg-gray-800',
													row.getIsSelected()
														? 'bg-gray-800/80'
														: 'hover:bg-gray-800/50'
												)}
												data-state={
													row.getIsSelected() ? 'selected' : undefined
												}>
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
										<tr>
											<td colSpan={columns.length}>
												<TrafficAidPostEmptyState
													openAddDialog={() => setIsAddDialogOpen(true)}
													columns={columns.length}
												/>
											</td>
										</tr>
									)}
								</TableBody>
							</Table>
						</div>

						<TrafficAidPostPagination table={table} />
					</>
				)}
			</div>

			{/* Dialogs */}
			<AddTrafficAidPostDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				onAddPost={handleAddPost}
			/>

			<TrafficAidPostDeleteDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				postsToDelete={postsToDelete}
				onDelete={handleDeletePost}
				loading={loading}
			/>
		</div>
	);
}
