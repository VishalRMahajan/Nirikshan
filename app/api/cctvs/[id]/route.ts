import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = await params;

		let data;
		try {
			const contentType = request.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				return NextResponse.json(
					{ error: 'Content-Type must be application/json' },
					{ status: 400 }
				);
			}

			const clonedRequest = request.clone();
			const rawBody = await clonedRequest.text();

			if (!rawBody || rawBody.trim() === '') {
				return NextResponse.json(
					{ error: 'Empty request body' },
					{ status: 400 }
				);
			}

			data = JSON.parse(rawBody);
		} catch (e) {
			return NextResponse.json(
				{ error: 'Invalid JSON in request body' },
				{ status: 400 }
			);
		}

		const { name, rtspUrl, latitude, longitude, status } = data;
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

		const updatedCCTV = await prisma.cCTV.update({
			where: { id },
			data: {
				name,
				rtspUrl,
				latitude,
				longitude,
				status,
			},
		});

		return NextResponse.json(updatedCCTV, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	await prisma.cCTV.delete({
		where: { id },
	});
	return NextResponse.json({ message: 'Deleted successfully' });
}

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = await params;

		const cctv = await prisma.cCTV.findUnique({
			where: { id },
		});

		if (!cctv) {
			return NextResponse.json({ error: 'CCTV not found' }, { status: 404 });
		}

		return NextResponse.json(cctv);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
