// app/api/cctvs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
	const cctvs = await prisma.cCTV.findMany();
	console.log(cctvs);
	return NextResponse.json(cctvs);
}

export async function POST(request: Request) {
	const body = await request.json();
	const { name, rtspUrl, latitude, longitude, status } = body;
	console.log(body);
	const newCCTV = await prisma.cCTV.create({
		data: {
			name,
			rtspUrl,
			latitude,
			longitude,
			status: status || 'active',
		},
	});
	return NextResponse.json(newCCTV, { status: 201 });
}
