import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Format a date string or object into a readable date format
 */
export function formatDate(
	date: Date | string | null | undefined,
	formatString = 'MMM d, yyyy'
): string {
	if (!date) return 'N/A';

	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		if (!isValid(dateObj)) return 'Invalid date';

		return format(dateObj, formatString);
	} catch (error) {
		console.error('Error formatting date:', error);
		return 'Invalid date';
	}
}

/**
 * Format a date string or object into a readable date and time format
 */
export function formatDateTime(date: Date | string | null | undefined): string {
	return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date to show how long ago it was (e.g., "2 hours ago")
 */
export function formatRelativeTime(
	date: Date | string | null | undefined
): string {
	if (!date) return 'N/A';

	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		if (!isValid(dateObj)) return 'Invalid date';

		return formatDistanceToNow(dateObj, { addSuffix: true });
	} catch (error) {
		console.error('Error formatting relative time:', error);
		return 'Unknown time';
	}
}

/**
 * Get timestamp in ISO format for API requests
 */
export function toISOString(
	date: Date | string | null | undefined
): string | undefined {
	if (!date) return undefined;

	try {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		if (!isValid(dateObj)) return undefined;

		return dateObj.toISOString();
	} catch (error) {
		console.error('Error converting to ISO:', error);
		return undefined;
	}
}
