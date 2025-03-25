import { AppSidebar } from '@/components/app-sidebar';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';

import { ReactNode } from 'react';

export default function Dashboard({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
					</div>
				</header>
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
