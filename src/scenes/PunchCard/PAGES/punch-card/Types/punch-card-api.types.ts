import { PatchApiBundleOffersIdStatusBodyStatus } from '@/shared/api/models';
import { Moment } from 'moment';

export interface GetServicesListParams {
    setServiceList: (list: Service[]) => void;
    setLoadingServices: (loading: boolean) => void;
}

export type Service = {
    id: number | string;
    name: string;
    description: string;
    price: number;
    groupId: number | null;
    groupName: string;
};

export type ServiceGroup = {
    id: number | null;
    group: string;
    services: Service[];
};

export type PunchCardFormikValues = {
    name: string;
    description: string;
    expiryMonths: number;
    bundleOfferType: string;
    price: string;
    applicableService: {
        services: Record<string | number, serviceArray>;
        residuePunch: string;
        originalPunch: string;
    };
    sellOnline: boolean;
};

export type serviceArray = {
    name: string;
    original: string | number;
    residue: string | number;
};

export type serviceType = {
    id: number | string;
    name: string;
};

export type SoldPunchCardFormikValues = {
    name: string;
    expiryDate: Moment;
    status: PatchApiBundleOffersIdStatusBodyStatus;
    bundleOfferType: 'PUNCH_BASED' | 'SERVICE_BASED';
    orignalPunches: number;
    residuePunches: number;
    applicableService: {
        services: Record<string | number, serviceArray>;
        residuePunch: number;
        originalPunch: number;
    };
};
