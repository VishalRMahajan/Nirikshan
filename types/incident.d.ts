import {
	IncidentSeverity,
	IncidentType,
	VerificationStatus,
} from '@prisma/client';

export interface User {
	id: string;
	name?: string;
	email: string;
	image?: string;
}

export interface CCTV {
	id: string;
	name: string;
	rtspUrl: string;
	location?: string;
	latitude: number;
	longitude: number;
	status: string;
}

export interface Incident {
	id: string;
	cctvId: string;
	cctv?: CCTV;
	detectedAt: Date | string;
	location?: string;
	latitude?: number;
	longitude?: number;
	confidenceScore: number;
	imageUrl?: string | null;
	thumbnailUrl?: string;
	verificationStatus: VerificationStatus;
	verifiedAt?: Date | string;
	verifiedBy?: string;
	verifiedByUser?: User;
	incidentType?: IncidentType;
	severity?: IncidentSeverity;
	notes?: string;
	responseNeeded: boolean;
	responseInitiated: boolean;
	resolvedAt?: Date | string;
	resolvedBy?: string;
	resolvedByUser?: User;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export interface IncidentVerificationFormData {
	action: 'verify';
	verificationStatus: VerificationStatus;
	incidentType?: IncidentType;
	severity?: IncidentSeverity;
	notes?: string;
	responseNeeded: boolean;
}

export interface IncidentResolveFormData {
	action: 'resolve';
	notes?: string;
}

export interface IncidentResponseFormData {
	action: 'initiateResponse';
}
