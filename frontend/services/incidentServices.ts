import { prisma } from '@/prisma';
import {
	IncidentSeverity,
	IncidentType,
	VerificationStatus,
} from '@prisma/client';

export async function createIncidentFromDetection(data: {
	cctvId: string;
	confidenceScore: number;
	imageUrl?: string;
	thumbnailUrl?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
}) {
	return await prisma.incident.create({
		data: {
			cctvId: data.cctvId,
			confidenceScore: data.confidenceScore,
			imageUrl: data.imageUrl,
			thumbnailUrl: data.thumbnailUrl,
			location: data.location,
			latitude: data.latitude,
			longitude: data.longitude,
			verificationStatus: VerificationStatus.PENDING,
		},
		include: {
			cctv: true,
		},
	});
}

export async function getIncidents(filter?: {
	verificationStatus?: VerificationStatus;
	limit?: number;
	offset?: number;
}) {
	return await prisma.incident.findMany({
		where: {
			verificationStatus: filter?.verificationStatus,
		},
		include: {
			cctv: true,
			verifiedByUser: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
		orderBy: {
			detectedAt: 'desc',
		},
		take: filter?.limit || 50,
		skip: filter?.offset || 0,
	});
}

export async function getPendingIncidents(limit?: number) {
	return await prisma.incident.findMany({
		where: {
			verificationStatus: VerificationStatus.PENDING,
		},
		include: {
			cctv: true,
		},
		orderBy: {
			detectedAt: 'desc',
		},
		take: limit || 50,
	});
}

export async function getIncidentById(id: string) {
	return await prisma.incident.findUnique({
		where: { id },
		include: {
			cctv: true,
			verifiedByUser: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	});
}

export async function verifyIncident(
	id: string,
	data: {
		verificationStatus: VerificationStatus;
		verifiedBy: string;
		incidentType?: IncidentType;
		severity?: IncidentSeverity;
		notes?: string;
		responseNeeded: boolean;
	}
) {
	return await prisma.incident.update({
		where: { id },
		data: {
			verificationStatus: data.verificationStatus,
			verifiedBy: data.verifiedBy,
			verifiedAt: new Date(),
			incidentType: data.incidentType,
			severity: data.severity,
			notes: data.notes,
			responseNeeded: data.responseNeeded,
		},
		include: {
			cctv: true,
			verifiedByUser: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	});
}

export async function initiateResponse(id: string, userId: string) {
	return await prisma.incident.update({
		where: { id },
		data: {
			responseInitiated: true,
		},
	});
}

export async function resolveIncident(
	id: string,
	userId: string,
	notes?: string
) {
	return await prisma.incident.update({
		where: { id },
		data: {
			resolvedAt: new Date(),
			resolvedBy: userId,
			notes: notes
				? `${notes}\n\nResolved on ${new Date().toLocaleString()}`
				: undefined,
		},
	});
}
