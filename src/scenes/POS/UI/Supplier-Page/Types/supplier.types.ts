
export interface SupplierSchema {
    id: string;
    seqId?: number;
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    email?: string;
    phone?: string;
    website: string;
    description: string;
    cvrNumber: string;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    outletId: number;
    createdAt?: string;
    updatedAt?: string;
    countryCode: string;
}