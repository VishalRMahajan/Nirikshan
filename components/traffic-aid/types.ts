export type TrafficAidPost = {
	id: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	contactNumber: string;
	hasPoliceService: boolean;
	hasAmbulance: boolean;
	hasFireService: boolean;
	operatingHours: string;
	additionalInfo?: string;
	status: string;
	createdAt: string;
	updatedAt: string;
};

export type TrafficAidPostStatusFilterValue = string[];
