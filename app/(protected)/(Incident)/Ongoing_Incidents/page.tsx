'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	RefreshCw,
	AlertCircle,
	CheckCircle,
	MapPin,
	Clock,
	Film,
	Bell,
	CheckCheck,
} from 'lucide-react';
import {
	VerificationStatusBadge,
	SeverityBadge,
} from '@/components/incident-verification/IncidentStatusBadge';
import { formatTimeAgo, getIncidentTypeLabel } from '@/lib/incident-helper';
import Dashboard from '@/components/dashboard';

export default function OngoingIncidentsPage() {
	const [incidents, setIncidents] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchVerifiedIncidents = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/incidents?status=APPROVED');

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			setIncidents(data);
		} catch (err) {
			console.error('Failed to fetch verified incidents:', err);
			setError('Failed to load verified incidents. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchVerifiedIncidents();

		const intervalId = setInterval(fetchVerifiedIncidents, 60000);

		return () => clearInterval(intervalId);
	}, []);

	const handleInitiateResponse = async (incidentId: string) => {
		try {
			const response = await fetch(`/api/incidents/${incidentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: 'initiateResponse',
				}),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			fetchVerifiedIncidents();
		} catch (err) {
			console.error('Failed to initiate response:', err);
			alert('Failed to initiate response. Please try again.');
		}
	};

	const handleResolveIncident = async (incidentId: string) => {
		try {
			const response = await fetch(`/api/incidents/${incidentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: 'resolve',
				}),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			fetchVerifiedIncidents();
		} catch (err) {
			console.error('Failed to resolve incident:', err);
			alert('Failed to resolve incident. Please try again.');
		}
	};

	return (
		<Dashboard>
			<div className='container mx-auto py-6'>
				<div className='mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div>
						<h1 className='text-2xl font-bold text-white'>Ongoing Incidents</h1>
						<p className='text-gray-400'>
							Monitor and manage verified incidents
						</p>
					</div>
					<Button
						onClick={fetchVerifiedIncidents}
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
					<div className='mb-6 rounded-md border border-red-800 bg-red-900/30 p-4 text-red-300'>
						<div className='flex items-center gap-2'>
							<AlertCircle className='h-5 w-5' />
							<p>{error}</p>
						</div>
					</div>
				)}

				{isLoading ? (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className='h-40 animate-pulse rounded-md bg-gray-800'
							/>
						))}
					</div>
				) : incidents.length === 0 ? (
					<div className='flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 p-12 text-center'>
						<div className='mb-3 rounded-full bg-green-900/30 p-3'>
							<CheckCircle className='h-6 w-6 text-green-400' />
						</div>
						<h3 className='mb-1 text-xl font-medium text-white'>All Clear</h3>
						<p className='max-w-md text-gray-400'>
							There are no ongoing incidents at this time. Verified incidents
							will appear here.
						</p>
					</div>
				) : (
					<div className='rounded-md border border-gray-700'>
						<div className='relative w-full overflow-auto'>
							<Table className='w-full caption-bottom text-sm'>
								<TableHeader>
									<TableRow className='border-gray-700 hover:bg-transparent'>
										<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
											Status
										</TableHead>
										<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
											Type & Severity
										</TableHead>
										<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
											Location
										</TableHead>
										<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
											Detected
										</TableHead>
										<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
											Verified By
										</TableHead>
										<TableHead className='h-10 whitespace-nowrap px-4 text-right font-medium text-gray-400'>
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{incidents.map((incident: any) => (
										<TableRow
											key={incident.id}
											className='border-gray-700 hover:bg-gray-800/50'>
											<TableCell className='px-4 py-3'>
												{incident.resolvedAt ? (
													<div className='flex items-center'>
														<div className='rounded-full bg-green-500/20 p-1'>
															<CheckCheck className='h-4 w-4 text-green-500' />
														</div>
														<span className='ml-2 text-gray-400'>Resolved</span>
													</div>
												) : incident.responseInitiated ? (
													<div className='flex items-center'>
														<div className='rounded-full bg-blue-500/20 p-1'>
															<Bell className='h-4 w-4 text-blue-500' />
														</div>
														<span className='ml-2 text-gray-400'>
															Response Initiated
														</span>
													</div>
												) : incident.responseNeeded ? (
													<div className='flex items-center'>
														<div className='rounded-full bg-red-500/20 p-1'>
															<AlertCircle className='h-4 w-4 text-red-500' />
														</div>
														<span className='ml-2 text-gray-400'>
															Response Needed
														</span>
													</div>
												) : (
													<VerificationStatusBadge
														status={incident.verificationStatus}
													/>
												)}
											</TableCell>
											<TableCell className='px-4 py-3'>
												<div className='space-y-2'>
													<div className='font-medium text-gray-300'>
														{getIncidentTypeLabel(incident.incidentType)}
													</div>
													{incident.severity && (
														<SeverityBadge severity={incident.severity} />
													)}
												</div>
											</TableCell>
											<TableCell className='px-4 py-3 text-gray-400'>
												<div className='flex items-center gap-1'>
													<MapPin className='h-3.5 w-3.5 text-gray-500' />
													<span>
														{incident.location ||
															incident.cctv?.location ||
															'Unknown location'}
													</span>
												</div>
											</TableCell>
											<TableCell className='px-4 py-3 text-gray-400'>
												<div className='flex items-center gap-1'>
													<Clock className='h-3.5 w-3.5 text-gray-500' />
													<span>{formatTimeAgo(incident.detectedAt)}</span>
												</div>
											</TableCell>
											<TableCell className='px-4 py-3'>
												{incident.verifiedByUser ? (
													<div className='flex items-center'>
														{incident.verifiedByUser.image && (
															<img
																src={incident.verifiedByUser.image}
																alt={incident.verifiedByUser.name}
																className='mr-2 h-6 w-6 rounded-full'
															/>
														)}
														<span className='text-gray-300'>
															{incident.verifiedByUser.name}
														</span>
													</div>
												) : (
													<span className='text-gray-500'>Unknown</span>
												)}
											</TableCell>
											<TableCell className='px-4 py-3 text-right'>
												<div className='flex items-center justify-end gap-2'>
													{incident.videoUrl && (
														<Button
															variant='outline'
															size='sm'
															className='h-8 gap-1 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
															onClick={() =>
																window.open(incident.videoUrl, '_blank')
															}>
															<Film className='h-3.5 w-3.5' />
															<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
																View Video
															</span>
														</Button>
													)}

													{!incident.resolvedAt &&
														!incident.responseInitiated &&
														incident.responseNeeded && (
															<Button
																variant='outline'
																size='sm'
																className='h-8 gap-1 border-blue-800 bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 hover:text-blue-200'
																onClick={() =>
																	handleInitiateResponse(incident.id)
																}>
																<Bell className='h-3.5 w-3.5' />
																<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
																	Initiate Response
																</span>
															</Button>
														)}

													{!incident.resolvedAt && (
														<Button
															variant='outline'
															size='sm'
															className='h-8 gap-1 border-green-800 bg-green-900/30 text-green-300 hover:bg-green-900/50 hover:text-green-200'
															onClick={() =>
																handleResolveIncident(incident.id)
															}>
															<CheckCheck className='h-3.5 w-3.5' />
															<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
																Mark as Resolved
															</span>
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				)}
			</div>
		</Dashboard>
	);
}
