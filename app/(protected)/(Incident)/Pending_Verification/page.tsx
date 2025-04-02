'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PendingVerificationTable } from '@/components/incident-verification/PendingVerificationTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Dashboard from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';

export default function PendingVerificationPage() {
	const [incidents, setIncidents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	const fetchPendingIncidents = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/incidents?status=pending');

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			setIncidents(data);
		} catch (err) {
			console.error('Failed to fetch pending incidents:', err);
			setError('Failed to load pending incidents. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPendingIncidents();
		toast({
			title: 'Auto-fetching incidents',
			description: 'Fetching pending incidents every 30 seconds.',
			variant: 'default',
		});

		const intervalId = setInterval(() => {
			fetchPendingIncidents();

			toast({
				title: 'Auto-fetching incidents',
				description: 'Pending incidents have been refreshed.',
				variant: 'default',
			});
		}, 30000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<Dashboard>
			<div className='container mx-auto space-y-8 p-6'>
				<div className='flex flex-col justify-between gap-6 sm:flex-row sm:items-center'>
					<div className='space-y-2'>
						<h1 className='text-2xl font-bold text-white'>
							Pending Verification
						</h1>
						<p className='text-gray-400'>
							Review and verify automatically detected incidents
						</p>
					</div>
					<Button
						onClick={fetchPendingIncidents}
						variant='outline'
						className='gap-2 self-start border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white sm:self-auto'
						disabled={isLoading}>
						<RefreshCw
							className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
						/>
						Refresh
					</Button>
				</div>

				{error && (
					<div className='rounded-md border border-red-800 bg-red-900/30 p-4 text-red-300'>
						<div className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5' />
							<p>{error}</p>
						</div>
					</div>
				)}

				<div className='rounded-lg border border-gray-800 bg-gray-900/50'>
					{isLoading ? (
						<div className='grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3'>
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className='h-40 animate-pulse rounded-md bg-gray-800'
								/>
							))}
						</div>
					) : incidents.length === 0 ? (
						<div className='flex flex-col items-center justify-center rounded-lg p-12 text-center'>
							<div className='mb-3 rounded-full bg-blue-900/30 p-3'>
								<CheckCircle className='h-6 w-6 text-blue-400' />
							</div>
							<h3 className='mb-1 text-xl font-medium text-white'>All Clear</h3>
							<p className='max-w-md text-gray-400'>
								There are no incidents awaiting verification. New incidents will
								appear here when detected.
							</p>
						</div>
					) : (
						<div className='overflow-hidden'>
							<PendingVerificationTable
								incidents={incidents}
								onRefresh={fetchPendingIncidents}
								isLoading={isLoading}
							/>
						</div>
					)}
				</div>
			</div>
		</Dashboard>
	);
}
