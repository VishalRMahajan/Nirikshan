import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
	getIncidents,
	getPendingIncidents,
	createIncidentFromDetection,
} from '../../../services/incidentServices';
import { VerificationStatus } from '@prisma/client';

export async function GET(req: Request) {
	try {
		const session = await auth();
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const url = new URL(req.url);
		const status = url.searchParams.get('status');
		const limit = url.searchParams.get('limit')
			? parseInt(url.searchParams.get('limit')!)
			: undefined;
		const offset = url.searchParams.get('offset')
			? parseInt(url.searchParams.get('offset')!)
			: undefined;

		let incidents;
		if (status === 'pending') {
			incidents = await getPendingIncidents(limit);
		} else {
			const verificationStatus = Object.values(VerificationStatus).includes(
				status as VerificationStatus
			)
				? (status as VerificationStatus)
				: undefined;

			incidents = await getIncidents({
				verificationStatus,
				limit,
				offset,
			});
		}

		return NextResponse.json(incidents);
	} catch (error) {
		console.error('Error fetching incidents:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch incidents' },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();

		if (!body.cctvId) {
			return NextResponse.json(
				{ error: 'CCTV ID is required' },
				{ status: 400 }
			);
		}

		if (
			body.confidenceScore === undefined ||
			body.confidenceScore < 0 ||
			body.confidenceScore > 1
		) {
			return NextResponse.json(
				{ error: 'Valid confidence score between 0 and 1 is required' },
				{ status: 400 }
			);
		}

		const newIncident = await createIncidentFromDetection({
			cctvId: body.cctvId,
			confidenceScore: body.confidenceScore,
			imageUrl: body.imageUrl,
			thumbnailUrl: body.thumbnailUrl,
			location: body.location,
			latitude: body.latitude,
			longitude: body.longitude,
		});

		return NextResponse.json(newIncident, { status: 201 });
	} catch (error) {
		console.error('Error creating incident:', error);
		return NextResponse.json(
			{ error: 'Failed to create incident' },
			{ status: 500 }
		);
	}
}
