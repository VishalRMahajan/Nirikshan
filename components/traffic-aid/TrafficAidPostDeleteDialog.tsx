import * as React from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TrafficAidPost } from './types';
import { Loader2 } from 'lucide-react';

interface TrafficAidPostDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	postsToDelete: TrafficAidPost[];
	onDelete: () => Promise<void>;
	loading: boolean;
}

export function TrafficAidPostDeleteDialog({
	open,
	onOpenChange,
	postsToDelete,
	onDelete,
	loading,
}: TrafficAidPostDeleteDialogProps) {
	const postCount = postsToDelete.length;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className='border-gray-800 bg-gray-900 text-white'>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-xl font-semibold text-gray-100'>
						Delete Traffic Aid {postCount > 1 ? 'Posts' : 'Post'}
					</AlertDialogTitle>
					<AlertDialogDescription className='text-gray-400'>
						{postCount > 1 ? (
							<>
								Are you sure you want to delete <strong>{postCount}</strong>{' '}
								traffic aid posts? This action cannot be undone.
							</>
						) : (
							<>
								Are you sure you want to delete the traffic aid post
								<strong> {postsToDelete[0]?.name}</strong>? This action cannot
								be undone.
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				{postCount > 1 && (
					<div className='my-4 max-h-[200px] overflow-auto rounded border border-gray-800 bg-gray-800/50 p-3'>
						<ul className='list-inside list-disc space-y-1'>
							{postsToDelete.map(post => (
								<li key={post.id} className='text-sm text-gray-300'>
									{post.name}{' '}
									<span className='text-gray-500'>({post.address})</span>
								</li>
							))}
						</ul>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel
						disabled={loading}
						className='border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						disabled={loading}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.preventDefault();
							onDelete();
						}}
						className='bg-red-600 text-white hover:bg-red-700'>
						{loading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Deleting...
							</>
						) : (
							'Delete'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
