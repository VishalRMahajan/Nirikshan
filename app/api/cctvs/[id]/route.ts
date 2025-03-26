// app/api/cctvs/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

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
