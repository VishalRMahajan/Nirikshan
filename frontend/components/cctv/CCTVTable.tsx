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
import { AddCCTVDialog } from '@/components/add-cctv-dialog';
import { cn } from '@/lib/utils';
import { CCTV } from './types';
import { createColumns } from './CCTVColumns';
import { CCTVTableHeader } from './CCTVTableHeader';
import { CCTVLoadingState } from './CCTVLoadingState';
import { CCTVEmptyState } from './CCTVEmptyState';
import { CCTVPagination } from './CCTVPagination';
import { CCTVDeleteDialog } from './CCTVDeleteDialog';

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

	const columns = React.useMemo(() => createColumns(), []);

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
		accidentVideo?: File | null;
	}) => {
		try {
			const formData = new FormData();
			formData.append('name', newCCTV.name);
			formData.append('rtspUrl', newCCTV.rtspUrl);
			formData.append('latitude', newCCTV.latitude.toString());
			formData.append('longitude', newCCTV.longitude.toString());
			formData.append('status', newCCTV.status);

			if (newCCTV.accidentVideo) {
				formData.append('accidentVideo', newCCTV.accidentVideo);
			}

			const response = await fetch('/api/cctvs', {
				method: 'POST',
				body: formData,
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

	return (
		<div className='w-full'>
			<CCTVTableHeader
				table={table}
				loading={loading}
				refreshData={refreshData}
				openAddDialog={() => setIsAddDialogOpen(true)}
				openDeleteDialog={openDeleteDialog}
			/>

			{/* Table */}
			<div className='overflow-hidden rounded-b-md border border-t-0 border-gray-700'>
				{loading ? (
					<CCTVLoadingState />
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
										<tr>
											<CCTVEmptyState
												openAddDialog={() => setIsAddDialogOpen(true)}
												columns={columns.length}
											/>
										</tr>
									)}
								</TableBody>
							</Table>
						</div>

						<CCTVPagination table={table} />
					</>
				)}
			</div>

			{/* Dialogs */}
			<AddCCTVDialog
				open={isAddDialogOpen}
				onClose={() => setIsAddDialogOpen(false)}
				onAddCCTV={handleAddCCTV}
			/>

			<CCTVDeleteDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				rowsToDelete={rowsToDelete}
				onDelete={handleDeleteCCTV}
				loading={loading}
			/>
		</div>
	);
}
