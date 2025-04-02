'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AccidentImage } from '@/components/incident-verification/AccidentImage';
import { IncidentVerificationForm } from '@/components/incident-verification/IncidentVerificationForm';
import {
	VerificationStatusBadge,
	SeverityBadge,
} from '@/components/incident-verification/IncidentStatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	ArrowLeft,
	Calendar,
	MapPin,
	Info,
	Clock,
	AlertCircle,
} from 'lucide-react';
import { formatIncidentDate, formatTimeAgo } from '@/lib/incident-helper';
import Dashboard from '@/components/dashboard';

interface IncidentVerificationPageProps {
	params: Promise<{ id: string }>;
}

export default function IncidentVerificationDetailPage({
	params,
}: IncidentVerificationPageProps) {
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);

	const [id, setId] = useState<string | null>(null);

	const [incident, setIncident] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		params
			.then(resolved => {
				if (isMounted) {
					setId(resolved.id);
				}
			})
			.catch(err => {
				console.error('Failed to unwrap params:', err);
			});

		return () => {
			isMounted = false;
		};
	}, [params]);

	useEffect(() => {
		if (!id) return;

		setIsLoading(true);
		setError(null);

		const fetchIncident = async () => {
			try {
				const response = await fetch(`/api/incidents/${id}`);
				if (!response.ok) {
					if (response.status === 404) {
						throw new Error('Incident not found');
					}
					throw new Error(`Error ${response.status}: ${response.statusText}`);
				}
				const data = await response.json();
				setIncident(data);
			} catch (err: any) {
				console.error('Failed to fetch incident:', err);
				setError(err.message || 'Failed to load incident details');
			} finally {
				setIsLoading(false);
			}
		};

		fetchIncident();
	}, [id]);

	const handleVerify = async (verificationData: any) => {
		if (!id) return;

		setIsSubmitting(true);
		setError(null);

		try {
			const response = await fetch(`/api/incidents/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(verificationData),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}
			router.push('/Pending_Verification');
			router.refresh();
		} catch (err: any) {
			console.error('Failed to verify incident:', err);
			setError(err.message || 'Failed to submit verification');
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<Dashboard>
				<div className='container mx-auto py-6'>
					<div className='mb-6'>
						<Skeleton className='h-8 w-48 bg-gray-800' />
						<Skeleton className='mt-2 h-4 w-64 bg-gray-800' />
					</div>
					<div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
						<div className='lg:col-span-3'>
							<Skeleton className='aspect-video w-full bg-gray-800' />
							<div className='mt-4 grid grid-cols-2 gap-4'>
								<Skeleton className='h-24 bg-gray-800' />
								<Skeleton className='h-24 bg-gray-800' />
							</div>
						</div>
						<div className='lg:col-span-2'>
							<Skeleton className='h-96 bg-gray-800' />
						</div>
					</div>
				</div>
			</Dashboard>
		);
	}

	if (error) {
		return (
			<Dashboard>
				<div className='container mx-auto py-6'>
					<Button
						variant='outline'
						className='mb-6 gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
						onClick={() => router.push('/Pending_Verification')}>
						<ArrowLeft className='h-4 w-4' />
						Back to Verification Queue
					</Button>
					<div className='rounded-md border border-red-800 bg-red-900/30 p-6 text-center'>
						<AlertCircle className='mx-auto mb-3 h-10 w-10 text-red-400' />
						<h3 className='text-xl font-semibold text-white'>
							Error Loading Incident
						</h3>
						<p className='mt-2 text-red-300'>{error}</p>
						<Button
							className='mt-4 bg-red-700 hover:bg-red-800'
							onClick={() => window.location.reload()}>
							Try Again
						</Button>
					</div>
				</div>
			</Dashboard>
		);
	}

	if (!incident) {
		return (
			<Dashboard>
				<div className='container mx-auto py-6'>
					<Button
						variant='outline'
						className='mb-6 gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
						onClick={() => router.push('/Pending_Verification')}>
						<ArrowLeft className='h-4 w-4' />
						Back to Verification Queue
					</Button>
					<div className='rounded-md border border-amber-800 bg-amber-900/30 p-6 text-center'>
						<Info className='mx-auto mb-3 h-10 w-10 text-amber-400' />
						<h3 className='text-xl font-semibold text-white'>
							Incident Not Found
						</h3>
						<p className='mt-2 text-amber-300'>
							This incident may have been removed or already verified.
						</p>
						<Button
							variant='outline'
							className='mt-4 border-amber-700 bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
							onClick={() => router.push('/Pending_Verification')}>
							Return to Verification Queue
						</Button>
					</div>
				</div>
			</Dashboard>
		);
	}

	return (
		<Dashboard>
			<div className='container mx-auto py-6'>
				<Button
					variant='outline'
					className='mb-6 gap-2 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
					onClick={() => router.push('/Pending_Verification')}>
					<ArrowLeft className='h-4 w-4' />
					Back to Verification Queue
				</Button>

				<div className='mb-6'>
					<div className='flex items-center gap-3'>
						<h1 className='text-2xl font-bold text-white'>
							Incident Verification
						</h1>
						<VerificationStatusBadge status={incident.verificationStatus} />
					</div>
					<p className='text-gray-400'>
						Review and verify incident from{' '}
						{incident.cctv?.name || 'Unknown Camera'}
					</p>
				</div>

				<div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
					<div className='space-y-6 lg:col-span-3'>
						{/* Video Player */}
						<div className='overflow-hidden rounded-lg border border-gray-700 bg-black'>
							<AccidentImage
								imageUrl={incident.imageUrl}
								alt={`Accident detected at ${incident.location || 'unknown location'}`}
								className='rounded-md border border-gray-700'
							/>
						</div>

						{/* Incident Details */}
						<div className='rounded-lg border border-gray-700 bg-gray-800 p-4'>
							<h3 className='mb-4 text-lg font-medium text-white'>
								Incident Details
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div className='space-y-1'>
									<p className='text-sm text-gray-400'>Camera</p>
									<p className='font-medium text-white'>
										{incident.cctv?.name || 'Unknown Camera'}
									</p>
								</div>
								<div className='space-y-1'>
									<p className='text-sm text-gray-400'>Location</p>
									<div className='flex items-center gap-1'>
										<MapPin className='h-4 w-4 text-gray-500' />
										<p className='font-medium text-white'>
											{incident.location ||
												incident.cctv?.location ||
												'Unknown location'}
										</p>
									</div>
								</div>
								<div className='space-y-1'>
									<p className='text-sm text-gray-400'>Detected At</p>
									<div className='flex items-center gap-1'>
										<Calendar className='h-4 w-4 text-gray-500' />
										<p className='font-medium text-white'>
											{formatIncidentDate(incident.detectedAt)}
										</p>
									</div>
								</div>
								<div className='space-y-1'>
									<p className='text-sm text-gray-400'>Time Since Detection</p>
									<div className='flex items-center gap-1'>
										<Clock className='h-4 w-4 text-gray-500' />
										<p className='font-medium text-white'>
											{formatTimeAgo(incident.detectedAt)}
										</p>
									</div>
								</div>
								<div className='space-y-1'>
									<p className='text-sm text-gray-400'>AI Confidence</p>
									<div className='flex items-center gap-2'>
										<div className='h-2 w-full max-w-24 rounded-full bg-gray-700'>
											<div
												className={`h-full rounded-full ${
													incident.confidenceScore > 0.7
														? 'bg-red-600'
														: incident.confidenceScore > 0.5
															? 'bg-amber-600'
															: 'bg-blue-600'
												}`}
												style={{
													width: `${Math.round(incident.confidenceScore * 100)}%`,
												}}
											/>
										</div>
										<span className='font-medium text-white'>
											{Math.round(incident.confidenceScore * 100)}%
										</span>
									</div>
								</div>
								{incident.incidentType && (
									<div className='space-y-1'>
										<p className='text-sm text-gray-400'>Incident Type</p>
										<p className='font-medium text-white'>
											{incident.incidentType}
										</p>
									</div>
								)}
								{incident.severity && (
									<div className='space-y-1'>
										<p className='text-sm text-gray-400'>Severity</p>
										<SeverityBadge severity={incident.severity} />
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Verification Form */}
					<div className='lg:col-span-2'>
						<div className='rounded-lg border border-gray-700 bg-gray-800 p-6'>
							<IncidentVerificationForm
								incident={incident}
								onVerify={handleVerify}
								isSubmitting={isSubmitting}
							/>
						</div>
					</div>
				</div>
			</div>
		</Dashboard>
	);
}
