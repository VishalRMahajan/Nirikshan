import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
	getIncidentById,
	verifyIncident,
	initiateResponse,
	resolveIncident,
} from '../../../../services/incidentServices';
import { VerificationStatus } from '@prisma/client';

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const { id } = await params;

		const incident = await getIncidentById(id);

		if (!incident) {
			return NextResponse.json(
				{ error: 'Incident not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(incident);
	} catch (error) {
		console.error('Error fetching incident:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch incident' },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();
		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await req.json();

		const existingIncident = await getIncidentById(id);
		if (!existingIncident) {
			return NextResponse.json(
				{ error: 'Incident not found' },
				{ status: 404 }
			);
		}

		if (body.action === 'verify') {
			if (!body.verificationStatus) {
				return NextResponse.json(
					{ error: 'Verification status is required' },
					{ status: 400 }
				);
			}

			const updatedIncident = await verifyIncident(id, {
				verificationStatus: body.verificationStatus,
				verifiedBy: session.user.id,
				incidentType: body.incidentType,
				severity: body.severity,
				notes: body.notes,
				responseNeeded: body.responseNeeded || false,
			});

			return NextResponse.json(updatedIncident);
		} else if (body.action === 'initiateResponse') {
			const updatedIncident = await initiateResponse(id, session.user.id);
			return NextResponse.json(updatedIncident);
		} else if (body.action === 'resolve') {
			const updatedIncident = await resolveIncident(
				id,
				session.user.id,
				body.notes
			);
			return NextResponse.json(updatedIncident);
		} else {
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}
	} catch (error) {
		console.error('Error updating incident:', error);
		return NextResponse.json(
			{ error: 'Failed to update incident' },
			{ status: 500 }
		);
	}
}
