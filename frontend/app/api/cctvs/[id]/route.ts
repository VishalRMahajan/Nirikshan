import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/prisma';

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params; // Use the id as a string directly

		const contentType = request.headers.get('content-type') || '';
		let name,
			rtspUrl,
			latitude,
			longitude,
			status,
			accidentVideo,
			removeExistingVideo;

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			name = formData.get('name') as string;
			rtspUrl = formData.get('rtspUrl') as string;
			latitude = parseFloat(formData.get('latitude') as string);
			longitude = parseFloat(formData.get('longitude') as string);
			status = formData.get('status') as string;
			accidentVideo = formData.get('accidentVideo') as File | null;
			removeExistingVideo = formData.get('removeExistingVideo') === 'true';
		} else if (contentType.includes('application/json')) {
			const jsonData = await request.json();
			name = jsonData.name;
			rtspUrl = jsonData.rtspUrl;
			latitude = jsonData.latitude;
			longitude = jsonData.longitude;
			status = jsonData.status;
		} else {
			return NextResponse.json(
				{ error: 'Unsupported content type' },
				{ status: 400 }
			);
		}

		if (
			!name ||
			!rtspUrl ||
			latitude === undefined ||
			longitude === undefined ||
			!status
		) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const rtspRegex = /^rtsp:\/\/.+/;
		if (!rtspRegex.test(rtspUrl)) {
			return NextResponse.json(
				{ error: 'Invalid RTSP URL format' },
				{ status: 400 }
			);
		}

		const existingCCTV = await prisma.cCTV.findUnique({
			where: { id },
		});
		if (!existingCCTV) {
			return NextResponse.json({ error: 'CCTV not found' }, { status: 404 });
		}

		const updateData: any = { name, rtspUrl, latitude, longitude, status };

		if (removeExistingVideo) {
			updateData.accidentVideoUrl = null;
			updateData.hasAccidentVideo = false;
		}

		if (accidentVideo) {
			const { writeFile, mkdir } = await import('fs/promises');
			const { join } = await import('path');
			const { cwd } = await import('process');
			const { existsSync } = await import('fs');

			const fileName = `${Date.now()}-${accidentVideo.name}`;
			const uploadDir = join(cwd(), 'public', 'uploads');
			if (!existsSync(uploadDir)) {
				await mkdir(uploadDir, { recursive: true });
			}
			const filePath = join(uploadDir, fileName);
			const buffer = Buffer.from(await accidentVideo.arrayBuffer());
			await writeFile(filePath, buffer);
			updateData.accidentVideoUrl = `/uploads/${fileName}`;
			updateData.hasAccidentVideo = true;
		}

		const updatedCCTV = await prisma.cCTV.update({
			where: { id },
			data: updateData,
		});
		return NextResponse.json({
			...updatedCCTV,
			createdAt: updatedCCTV.createdAt.toISOString(),
		});
	} catch (error) {
		console.error('PATCH error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: (error as Error).message },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params; // Use the id as a string directly
	try {
		const deletedCCTV = await prisma.cCTV.delete({
			where: { id },
		});
		return NextResponse.json({ message: 'Deleted successfully', id });
	} catch (error) {
		console.error('DELETE error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: (error as Error).message },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params; // Use the id as a string directly
	try {
		const cctv = await prisma.cCTV.findUnique({ where: { id } });
		if (!cctv) {
			return NextResponse.json({ error: 'CCTV not found' }, { status: 404 });
		}
		return NextResponse.json({
			...cctv,
			createdAt: cctv.createdAt.toISOString(),
		});
	} catch (error) {
		console.error('GET error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', details: (error as Error).message },
			{ status: 500 }
		);
	}
}
