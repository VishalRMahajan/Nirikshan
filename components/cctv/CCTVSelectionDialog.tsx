'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CCTV } from './types';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Video, Search, Check } from 'lucide-react';

interface CCTVSelectionDialogProps {
	open: boolean;
	onClose: () => void;
	cctvs: CCTV[];
	onSelect: (cctv: CCTV) => void;
}

export function CCTVSelectionDialog({
	open,
	onClose,
	cctvs,
	onSelect,
}: CCTVSelectionDialogProps) {
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedId, setSelectedId] = React.useState<string | null>(null);

	// Reset when dialog opens/closes
	React.useEffect(() => {
		if (!open) {
			setSearchQuery('');
			setSelectedId(null);
		}
	}, [open]);

	// Filter CCTVs based on search query
	const filteredCCTVs = cctvs.filter(
		cctv =>
			cctv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cctv.rtspUrl.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleSelect = (cctv: CCTV) => {
		setSelectedId(cctv.id);
	};

	const handleConfirm = () => {
		if (selectedId) {
			const selected = cctvs.find(cctv => cctv.id === selectedId);
			if (selected) {
				onSelect(selected);
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-4xl border-gray-700 bg-gray-900 text-white'>
				<DialogHeader>
					<DialogTitle className='text-lg font-medium text-gray-100'>
						Select CCTV Camera
					</DialogTitle>
				</DialogHeader>

				<div className='flex items-center gap-2 pt-4'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
						<Input
							placeholder='Search cameras by name or URL...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full border-gray-700 bg-gray-800 pl-10 text-white placeholder-gray-500 focus:border-blue-600'
						/>
					</div>
				</div>

				<div className='mt-2 h-[350px] overflow-auto rounded-md border border-gray-700'>
					<Table>
						<TableHeader className='bg-gray-800'>
							<TableRow className='border-gray-700 hover:bg-transparent'>
								<TableHead className='w-10'></TableHead>
								<TableHead className='text-gray-400'>Name</TableHead>
								<TableHead className='text-gray-400'>Location</TableHead>
								<TableHead className='text-gray-400'>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredCCTVs.length === 0 ? (
								<TableRow className='border-gray-700 hover:bg-transparent'>
									<TableCell
										colSpan={4}
										className='h-32 text-center text-gray-500'>
										No cameras found with accident footage
									</TableCell>
								</TableRow>
							) : (
								filteredCCTVs.map(cctv => (
									<TableRow
										key={cctv.id}
										className={`cursor-pointer border-gray-700 ${
											selectedId === cctv.id
												? 'bg-blue-900/20 hover:bg-blue-900/30'
												: 'hover:bg-gray-800/70'
										}`}
										onClick={() => handleSelect(cctv)}>
										<TableCell className='py-2'>
											<div className='flex h-full items-center justify-center'>
												{selectedId === cctv.id ? (
													<Check className='h-5 w-5 text-blue-500' />
												) : (
													<Video className='h-5 w-5 text-gray-500' />
												)}
											</div>
										</TableCell>
										<TableCell className='font-medium'>{cctv.name}</TableCell>
										<TableCell className='text-sm text-gray-400'>
											{cctv.latitude.toFixed(4)}, {cctv.longitude.toFixed(4)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													cctv.status === 'active' ? 'default' : 'secondary'
												}
												className='capitalize'>
												{cctv.status}
											</Badge>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<div className='flex justify-end gap-2 pt-2'>
					<Button
						variant='outline'
						onClick={onClose}
						className='border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!selectedId}
						className='bg-blue-600 text-white hover:bg-blue-700'>
						Select Camera
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
