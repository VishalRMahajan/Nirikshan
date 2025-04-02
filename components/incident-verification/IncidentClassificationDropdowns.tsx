'use client';

import React from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { IncidentSeverity, IncidentType } from '@prisma/client';

interface IncidentClassificationDropdownsProps {
	incidentType: string | null;
	severity: string | null;
	onIncidentTypeChange: (value: string) => void;
	onSeverityChange: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export function IncidentClassificationDropdowns({
	incidentType,
	severity,
	onIncidentTypeChange,
	onSeverityChange,
	disabled = false,
	className = '',
}: IncidentClassificationDropdownsProps) {
	const incidentTypes = [
		{ value: IncidentType.VEHICLE_COLLISION, label: 'Vehicle Collision' },
		{ value: IncidentType.FIRE, label: 'Fire' },
		{ value: IncidentType.PEDESTRIAN_ACCIDENT, label: 'Pedestrian Accident' },
		{ value: IncidentType.DEBRIS_ON_ROAD, label: 'Debris on Road' },
		{ value: IncidentType.STOPPED_VEHICLE, label: 'Stopped Vehicle' },
		{ value: IncidentType.WRONG_WAY_DRIVER, label: 'Wrong-way Driver' },
		{ value: IncidentType.OTHER, label: 'Other' },
	];

	return (
		<div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
			<div className='space-y-2'>
				<label
					htmlFor='incident-type'
					className='text-sm font-medium text-gray-200'>
					Incident Type
				</label>
				<Select
					value={incidentType || undefined}
					onValueChange={onIncidentTypeChange}
					disabled={disabled}>
					<SelectTrigger
						id='incident-type'
						className='w-full border-gray-700 bg-gray-800 text-white focus:ring-blue-600'>
						<SelectValue placeholder='Select incident type' />
					</SelectTrigger>
					<SelectContent className='border-gray-700 bg-gray-800 text-white'>
						{incidentTypes.map(type => (
							<SelectItem
								key={type.value}
								value={type.value}
								className='focus:bg-gray-700'>
								{type.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<label htmlFor='severity' className='text-sm font-medium text-gray-200'>
					Severity
				</label>
				<Select
					value={severity || undefined}
					onValueChange={onSeverityChange}
					disabled={disabled}>
					<SelectTrigger
						id='severity'
						className='w-full border-gray-700 bg-gray-800 text-white focus:ring-blue-600'>
						<SelectValue placeholder='Select severity' />
					</SelectTrigger>
					<SelectContent className='border-gray-700 bg-gray-800 text-white'>
						<SelectItem
							value={IncidentSeverity.CRITICAL}
							className='focus:bg-gray-700'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-red-500'></div>
								Critical - Immediate action required
							</div>
						</SelectItem>
						<SelectItem
							value={IncidentSeverity.MAJOR}
							className='focus:bg-gray-700'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-amber-500'></div>
								Major - Urgent attention needed
							</div>
						</SelectItem>
						<SelectItem
							value={IncidentSeverity.MINOR}
							className='focus:bg-gray-700'>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-2 rounded-full bg-blue-500'></div>
								Minor - Low priority
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
