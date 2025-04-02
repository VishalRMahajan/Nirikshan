'use client';

import React, { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
	IncidentSeverity,
	IncidentType,
	VerificationStatus,
} from '@prisma/client';

const formSchema = z.object({
	verificationStatus: z.enum(['APPROVED', 'REJECTED']),
	incidentType: z.string().nullable(),
	severity: z.string().nullable(),
	notes: z.string().min(0).max(500).optional(),
	responseNeeded: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface IncidentVerificationFormProps {
	incident: any;
	onVerify: (data: any) => void;
	isSubmitting: boolean;
}

export function IncidentVerificationForm({
	incident,
	onVerify,
	isSubmitting,
}: IncidentVerificationFormProps) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			verificationStatus: VerificationStatus.APPROVED,
			incidentType: incident.incidentType || null,
			severity: incident.severity || null,
			notes: '',
			responseNeeded: false,
		},
	});

	const verificationStatus = form.watch('verificationStatus');
	const isRejected = verificationStatus === VerificationStatus.REJECTED;

	function onSubmit(data: FormValues) {
		onVerify({
			action: 'verify',
			...data,
		});
	}

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
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
				<div className='mb-6 space-y-1'>
					<h3 className='text-lg font-medium text-white'>Decision</h3>
					<p className='text-sm text-gray-400'>
						Verify whether this incident is genuine or a false detection
					</p>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<Button
						type='button'
						className={`flex flex-1 flex-row gap-2 border-2 bg-transparent p-4 hover:bg-green-900/20 ${
							verificationStatus === VerificationStatus.APPROVED
								? 'border-green-500 bg-green-900/20 text-white'
								: 'border-gray-700 text-gray-400 hover:text-white'
						}`}
						onClick={() =>
							form.setValue('verificationStatus', VerificationStatus.APPROVED)
						}>
						<CheckCircle2
							className={`h-6 w-6 ${
								verificationStatus === VerificationStatus.APPROVED
									? 'text-green-500'
									: 'text-gray-500'
							}`}
						/>
						<span>Confirm</span>
					</Button>

					<Button
						type='button'
						className={`flex flex-1 flex-row gap-2 border-2 bg-transparent p-4 hover:bg-red-900/20 ${
							verificationStatus === VerificationStatus.REJECTED
								? 'border-red-500 bg-red-900/20 text-white'
								: 'border-gray-700 text-gray-400 hover:text-white'
						}`}
						onClick={() =>
							form.setValue('verificationStatus', VerificationStatus.REJECTED)
						}>
						<XCircle
							className={`h-6 w-6 ${
								verificationStatus === VerificationStatus.REJECTED
									? 'text-red-500'
									: 'text-gray-500'
							}`}
						/>
						<span>Reject</span>
					</Button>
				</div>

				{!isRejected && (
					<>
						<FormField
							control={form.control}
							name='incidentType'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Incident Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value || undefined}>
										<FormControl>
											<SelectTrigger className='border-gray-700 bg-gray-800 text-white focus:ring-blue-500'>
												<SelectValue placeholder='Select incident type' />
											</SelectTrigger>
										</FormControl>
										<SelectContent className='border-gray-700 bg-gray-800 text-white'>
											{incidentTypes.map(type => (
												<SelectItem
													key={type.value}
													value={type.value}
													className='hover:bg-gray-700'>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='severity'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Severity</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value || undefined}>
										<FormControl>
											<SelectTrigger className='border-gray-700 bg-gray-800 text-white focus:ring-blue-500'>
												<SelectValue placeholder='Select severity' />
											</SelectTrigger>
										</FormControl>
										<SelectContent className='border-gray-700 bg-gray-800 text-white'>
											<SelectItem
												value={IncidentSeverity.CRITICAL}
												className='hover:bg-gray-700'>
												<div className='flex items-center gap-2'>
													<div className='h-2 w-2 rounded-full bg-red-500'></div>
													Critical - Immediate action required
												</div>
											</SelectItem>
											<SelectItem
												value={IncidentSeverity.MAJOR}
												className='hover:bg-gray-700'>
												<div className='flex items-center gap-2'>
													<div className='h-2 w-2 rounded-full bg-amber-500'></div>
													Major - Urgent attention needed
												</div>
											</SelectItem>
											<SelectItem
												value={IncidentSeverity.MINOR}
												className='hover:bg-gray-700'>
												<div className='flex items-center gap-2'>
													<div className='h-2 w-2 rounded-full bg-blue-500'></div>
													Minor - Low priority
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='responseNeeded'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white'
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Requires emergency response</FormLabel>
										<FormDescription className='text-gray-500'>
											Check this if this incident requires immediate emergency
											response
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</>
				)}

				<FormField
					control={form.control}
					name='notes'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{isRejected ? 'Rejection Reason' : 'Additional Notes'}
							</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder={
										isRejected
											? 'Explain why this is a false detection...'
											: 'Add any relevant details about the incident...'
									}
									className='border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
									rows={4}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<Button
					type='submit'
					className={`w-full ${
						isRejected
							? 'bg-red-600 hover:bg-red-700'
							: 'bg-blue-600 hover:bg-blue-700'
					}`}
					disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							{isRejected ? 'Rejecting Incident...' : 'Confirming Incident...'}
						</>
					) : (
						<>{isRejected ? 'Reject as False Detection' : 'Confirm Incident'}</>
					)}
				</Button>
			</form>
		</Form>
	);
}
