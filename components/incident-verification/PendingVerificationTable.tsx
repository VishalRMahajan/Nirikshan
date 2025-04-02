'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	AlertTriangle,
	AlertCircle,
	Info,
	Clock,
	Eye,
	Film,
	RefreshCw,
} from 'lucide-react';
import { formatTimeAgo, estimateSeverity } from '@/lib/incident-helper';

interface Incident {
	id: string;
	detectedAt: string;
	location?: string;
	cctvId: string;
	cctv?: {
		name: string;
		location: string;
	};
	confidenceScore: number;
	severity?: 'CRITICAL' | 'MAJOR' | 'MINOR';
	incidentType?: string;
	videoUrl?: string;
	thumbnailUrl?: string;
}

interface PendingVerificationTableProps {
	incidents: Incident[];
	isLoading?: boolean;
	onRefresh: () => void;
}

export function PendingVerificationTable({
	incidents,
	isLoading = false,
	onRefresh,
}: PendingVerificationTableProps) {
	const router = useRouter();

	const handleVerify = (incidentId: string) => {
		router.push(`/incident_verification/${incidentId}`);
	};

	const getSeverityBadge = (
		severity: string | null | undefined,
		confidenceScore: number
	) => {
		const effectiveSeverity =
			severity ||
			(confidenceScore > 0.8
				? '>80%'
				: confidenceScore > 0.6
					? '60-80%'
					: '<60%');

		switch (effectiveSeverity) {
			case '>80%':
				return <Badge className='bg-red-600 text-white'>&gt;80%</Badge>;
			case '60-80%':
				return <Badge className='bg-amber-600 text-white'>60-80%</Badge>;
			case '<60%':
				return <Badge className='bg-blue-600 text-white'>&lt;60%</Badge>;
			default:
				return <Badge className='bg-gray-600 text-white'>Unknown</Badge>;
		}
	};

	return (
		<div className='rounded-md border border-gray-700'>
			<div className='relative w-full overflow-auto'>
				<Table className='w-full caption-bottom text-sm'>
					<TableHeader>
						<TableRow className='border-gray-700 hover:bg-transparent'>
							<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
								Severity
							</TableHead>
							<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
								Camera
							</TableHead>
							<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
								Location
							</TableHead>
							<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
								Detected
							</TableHead>
							<TableHead className='h-10 whitespace-nowrap px-4 text-left font-medium text-gray-400'>
								Confidence
							</TableHead>
							<TableHead className='h-10 whitespace-nowrap px-4 text-right font-medium text-gray-400'>
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{incidents.length === 0 ? (
							<TableRow className='border-gray-700'>
								<TableCell
									colSpan={6}
									className='h-24 text-center text-gray-400'>
									No pending incidents found
								</TableCell>
							</TableRow>
						) : (
							incidents.map(incident => (
								<TableRow
									key={incident.id}
									className='border-gray-700 hover:bg-gray-800/50'>
									<TableCell className='px-4 py-3'>
										{getSeverityBadge(
											incident.severity,
											incident.confidenceScore
										)}
									</TableCell>
									<TableCell className='px-4 py-3 font-medium text-gray-300'>
										{incident.cctv?.name ||
											`Camera ${incident.cctvId.slice(0, 8)}`}
									</TableCell>
									<TableCell className='px-4 py-3 text-gray-400'>
										{incident.location ||
											incident.cctv?.location ||
											'Unknown location'}
									</TableCell>
									<TableCell className='px-4 py-3 text-gray-400'>
										<div className='flex items-center'>
											<Clock className='mr-1 h-3 w-3 text-gray-500' />
											{formatTimeAgo(incident.detectedAt)}
										</div>
									</TableCell>
									<TableCell className='px-4 py-3'>
										<div className='flex items-center'>
											<div className='h-2 w-full max-w-24 overflow-hidden rounded-full bg-gray-700'>
												<div
													className={`h-full ${
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
											<span className='ml-2 text-gray-400'>
												{Math.round(incident.confidenceScore * 100)}%
											</span>
										</div>
									</TableCell>
									<TableCell className='px-4 py-3 text-right'>
										<div className='flex items-center justify-end gap-2'>
											{incident.videoUrl && (
												<Button
													variant='outline'
													size='sm'
													className='h-8 gap-1 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
													onClick={() =>
														window.open(incident.videoUrl!, '_blank')
													}>
													<Film className='h-3.5 w-3.5' />
													<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
														View Video
													</span>
												</Button>
											)}
											<Button
												variant='outline'
												size='sm'
												className='h-8 gap-1 border-blue-800 bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 hover:text-blue-200'
												onClick={() => handleVerify(incident.id)}>
												<Eye className='h-3.5 w-3.5' />
												<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
													Verify
												</span>
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
