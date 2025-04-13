'use client';
import Dashboard from '@/components/dashboard';
import dynamic from 'next/dynamic';
import { CCTVTable } from '@/components/cctv/CCTVTable';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
	ssr: false,
});

export default function CCTVSettings() {
	return (
		<Dashboard>
			<div className='m-5'>
				<CCTVTable />
			</div>
		</Dashboard>
	);
}
