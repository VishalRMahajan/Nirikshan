'use client';

import * as React from 'react';
import {
	Command,
	Cctv,
	Pencil,
	Siren,
	Ambulance,
	AlertTriangle,
	Clock,
	CheckCircle2,
	Bell,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();

	const data = {
		user: {
			name: session?.user?.name || 'Guest',
			email: session?.user?.email || 'guest@example.com',
			avatar: session?.user?.image || '/avatars/default-avatar.png',
		},
		navCCTV: [
			{
				title: 'Live Monitoring',
				url: '/',
				icon: Cctv,
				isactive: true,
			},
			{
				title: 'CCTV Settings',
				url: '/cctv_setting',
				icon: Pencil,
			},
		],
		navIncident: [
			{
				title: 'Pending Verification',
				url: '/Pending_Verification',
				icon: Clock,
			},
			{
				title: 'Ongoing Incidents',
				url: '/Ongoing_Incidents',
				icon: AlertTriangle,
			},
		],
		navTraffic: [
			{
				title: 'Traffic Aid',
				url: '/Traffic_Aid',
				icon: Siren,
			},
		],
	};

	return (
		<Sidebar variant='inset' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size='lg' asChild>
							<a href='#'>
								<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
									<Command className='size-4' />
								</div>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-semibold'>Nirikshan</span>
									<span className='truncate text-xs'>Highway Dashboard</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain heading={'CCTV'} items={data.navCCTV} />
				<NavMain heading={'Incident'} items={data.navIncident} />
				<NavMain heading={'Traffic'} items={data.navTraffic} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
