import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const rtspUrl = formData.get('rtspUrl') as string;
		const latitude = parseFloat(formData.get('latitude') as string);
		const longitude = parseFloat(formData.get('longitude') as string);
		const status = formData.get('status') as string;
		const accidentVideo = formData.get('accidentVideo') as File | null;

		let accidentVideoUrl = null;
		let hasAccidentVideo = false;

		// Process video if provided
		if (accidentVideo) {
			// Create a unique filename
			const fileName = `${Date.now()}-${accidentVideo.name}`;

			// Define the upload directory
			const uploadDir = join(cwd(), 'public', 'uploads');

			// Create the directory if it doesn't exist
			if (!existsSync(uploadDir)) {
				await mkdir(uploadDir, { recursive: true });
				console.log(`Created directory: ${uploadDir}`);
			}

			const filePath = join(uploadDir, fileName);

			// Convert file to buffer
			const buffer = Buffer.from(await accidentVideo.arrayBuffer());

			// Save the file
			await writeFile(filePath, buffer);
			console.log(`File saved to: ${filePath}`);

			// Set the URL and flag
			accidentVideoUrl = `/uploads/${fileName}`;
			hasAccidentVideo = true;
		}

		// Set current date explicitly for createdAt
		const currentDate = new Date().toISOString();

		// Create the CCTV in the database with the video information
		const cctv = await prisma.cCTV.create({
			data: {
				name,
				rtspUrl,
				latitude,
				longitude,
				status,
				accidentVideoUrl,
				hasAccidentVideo,
			},
		});

		// Return formatted data with ISO string date
		return NextResponse.json(
			{
				...cctv,
				createdAt: cctv.createdAt.toISOString(),
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating CCTV:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: (error as Error).message },
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		const cctvs = await prisma.cCTV.findMany({
			orderBy: { createdAt: 'desc' },
		});

		// Format dates to ISO strings for consistent handling
		const formattedCctvs = cctvs.map(cctv => ({
			...cctv,
			createdAt: cctv.createdAt.toISOString(),
		}));

		return NextResponse.json(formattedCctvs);
	} catch (error) {
		console.error('Error fetching CCTVs:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
