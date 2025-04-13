import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
	try {
		const posts = await prisma.trafficAidPost.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});

		const formattedPosts = posts.map(post => ({
			...post,
			id: post.id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		}));

		return NextResponse.json(formattedPosts);
	} catch (error) {
		console.error('Error fetching traffic aid posts:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch traffic aid posts' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();
		const {
			name,
			address,
			latitude,
			longitude,
			contactNumber,
			hasPoliceService,
			hasAmbulance,
			hasFireService,
			operatingHours,
			status,
			additionalInfo,
		} = data;

		if (
			!name ||
			!address ||
			latitude === undefined ||
			longitude === undefined ||
			!contactNumber
		) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		const post = await prisma.trafficAidPost.create({
			data: {
				name,
				address,
				latitude,
				longitude,
				contactNumber,
				hasPoliceService: Boolean(hasPoliceService),
				hasAmbulance: Boolean(hasAmbulance),
				hasFireService: Boolean(hasFireService),
				operatingHours: operatingHours || '24/7',
				status: status || 'active',
				additionalInfo,
			},
		});

		return NextResponse.json(
			{
				...post,
				id: post.id.toString(),
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating traffic aid post:', error);
		return NextResponse.json(
			{ error: 'Failed to create traffic aid post' },
			{ status: 500 }
		);
	}
}
