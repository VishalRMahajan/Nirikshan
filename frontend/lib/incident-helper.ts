import { format, formatDistanceToNow } from 'date-fns';

import {
	IncidentSeverity,
	IncidentType,
	VerificationStatus,
} from '@prisma/client';

export function formatIncidentDate(date: Date | string | null): string {
	if (!date) return 'N/A';

	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return format(dateObj, 'MMM d, yyyy h:mm a');
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'Invalid date';
	}
}

export function formatTimeAgo(date: Date | string | null): string {
	if (!date) return 'N/A';

	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return formatDistanceToNow(dateObj, { addSuffix: true });
	} catch (error) {
		console.error('Error formatting relative time:', error);
		return 'Unknown time';
	}
}

export function getVerificationStatusColor(
	status: VerificationStatus | null
): string {
	if (!status) return 'bg-gray-500';

	switch (status) {
		case VerificationStatus.PENDING:
			return 'bg-amber-500';
		case VerificationStatus.APPROVED:
			return 'bg-green-600';
		case VerificationStatus.REJECTED:
			return 'bg-red-600';
		default:
			return 'bg-gray-500';
	}
}

export function getSeverityColor(severity: IncidentSeverity | null): string {
	if (!severity) return 'bg-gray-500';

	switch (severity) {
		case IncidentSeverity.CRITICAL:
			return 'bg-red-600';
		case IncidentSeverity.MAJOR:
			return 'bg-amber-600';
		case IncidentSeverity.MINOR:
			return 'bg-blue-600';
		default:
			return 'bg-gray-500';
	}
}

export function getIncidentTypeLabel(type: IncidentType | null): string {
	if (!type) return 'Unspecified';

	switch (type) {
		case IncidentType.VEHICLE_COLLISION:
			return 'Vehicle Collision';
		case IncidentType.FIRE:
			return 'Fire';
		case IncidentType.PEDESTRIAN_ACCIDENT:
			return 'Pedestrian Accident';
		case IncidentType.DEBRIS_ON_ROAD:
			return 'Debris on Road';
		case IncidentType.STOPPED_VEHICLE:
			return 'Stopped Vehicle';
		case IncidentType.WRONG_WAY_DRIVER:
			return 'Wrong-way Driver';
		case IncidentType.OTHER:
			return 'Other';
		default:
			return 'Unknown';
	}
}

export function estimateSeverity(confidenceScore: number): IncidentSeverity {
	if (confidenceScore >= 0.8) {
		return IncidentSeverity.CRITICAL;
	} else if (confidenceScore >= 0.5) {
		return IncidentSeverity.MAJOR;
	} else {
		return IncidentSeverity.MINOR;
	}
}
