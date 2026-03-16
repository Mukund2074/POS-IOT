import { PunchCardFormikValues } from '../Types/punch-card-api.types';

export class PunchCardHandler {
    async buildPayload(values: PunchCardFormikValues) {
        let originalPunch = 0;
        let residuePunch = 0;
        const hasIdZero = Object.keys(values.applicableService.services).some((serviceId) => String(serviceId) === '0');

        const services = (() => {
            if (hasIdZero) {
                return null;
            }

            return Object.fromEntries(
                Object.entries(values.applicableService.services).map(([key, service]) => {
                    if (values.bundleOfferType === 'PUNCH_BASED') {
                        // For punch-based, only keep name
                        return [key, { name: service.name }];
                    }

                    if (values.bundleOfferType === 'SERVICE_BASED') {
                        // Always sum numbers, even if they come as strings
                        originalPunch += Number(service.original) || 0;
                        residuePunch += Number(service.residue) || 0;
                    }

                    return [
                        key,
                        {
                            ...service,
                            original: Number(service.original) || 0,
                            residue: Number(service.residue) || 0,
                        },
                    ];
                }),
            );
        })();
        if (!services) {
            originalPunch = Number(values.applicableService?.services[0]?.original);
            residuePunch = Number(values.applicableService?.services[0]?.residue);
        }

        return {
            ...values,
            applicableService: {
                originalPunch:
                    values.bundleOfferType === 'SERVICE_BASED' ? originalPunch : values.applicableService.originalPunch,
                residuePunch:
                    values.bundleOfferType === 'SERVICE_BASED' ? residuePunch : values.applicableService.residuePunch,
                services,
            },
            price: values.price?.includes('.') ? Number(values.price) : parseInt(values.price, 10),
        };
    }
}

export const punchCardHandler = new PunchCardHandler();
