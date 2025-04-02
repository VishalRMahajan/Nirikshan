'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	IncidentVerificationFormData,
	IncidentResponseFormData,
	IncidentResolveFormData,
} from '@/types/incident';

export function useIncidentVerification(incidentId: string) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const verifyIncident = async (data: IncidentVerificationFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/incidents/${incidentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			router.push('/Pending_Verification');
			router.refresh();
			return true;
		} catch (err: any) {
			setError(err.message || 'Failed to verify incident');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const initiateResponse = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data: IncidentResponseFormData = {
				action: 'initiateResponse',
			};

			const response = await fetch(`/api/incidents/${incidentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			// Successfully initiated response
			router.refresh();
			return true;
		} catch (err: any) {
			setError(err.message || 'Failed to initiate response');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Mark an incident as resolved
	 */
	const resolveIncident = async (notes?: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const data: IncidentResolveFormData = {
				action: 'resolve',
				notes,
			};

			const response = await fetch(`/api/incidents/${incidentId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			// Successfully resolved
			router.refresh();
			return true;
		} catch (err: any) {
			setError(err.message || 'Failed to resolve incident');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		verifyIncident,
		initiateResponse,
		resolveIncident,
		isLoading,
		error,
	};
}
