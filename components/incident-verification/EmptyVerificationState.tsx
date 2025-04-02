import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyVerificationStateProps {
	onRefresh?: () => void;
	title?: string;
	description?: string;
}

export function EmptyVerificationState({
	onRefresh,
	title = 'All Clear',
	description = 'There are no incidents awaiting verification. New incidents will appear here when detected.',
}: EmptyVerificationStateProps) {
	return (
		<div className='flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 p-12 text-center'>
			<div className='mb-3 rounded-full bg-blue-900/30 p-3'>
				<CheckCircle className='h-6 w-6 text-blue-400' />
			</div>
			<h3 className='mb-1 text-xl font-medium text-white'>{title}</h3>
			<p className='max-w-md text-gray-400'>{description}</p>
			{onRefresh && (
				<Button
					variant='outline'
					className='mt-6 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
					onClick={onRefresh}>
					Check for New Incidents
				</Button>
			)}
		</div>
	);
}
