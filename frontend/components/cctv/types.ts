import { ColumnDef } from '@tanstack/react-table';

export type CCTV = {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	rtspUrl: string;
	status: string;
	createdAt: string;
	accidentVideoUrl?: string;
	hasAccidentVideo?: boolean;
};

export type CCTVStatusFilterValue = string[];
