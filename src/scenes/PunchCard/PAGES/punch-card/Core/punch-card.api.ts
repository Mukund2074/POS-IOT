// @ts-ignore
import { GetServiceGroup } from '@/utils/Api/Service.js';
import { GetServicesListParams, PunchCardFormikValues, Service, ServiceGroup } from '../Types/punch-card-api.types';
import { t } from 'i18next';
import { api } from '@/utils/Api/POS';
import { PostApiBundleOffersBody } from '@/shared/api/models';
import { QueryClient } from '@tanstack/react-query';

export class PunchCardApi {
    private serviceList: Service[];
    private queryClient: QueryClient;
    private toast: (message: string, type: 'success' | 'error') => void;
    private navigate: (path: string) => void;

    static defaultValue = {
        0: { name: t('PunchCard.AnyService'), original: '1', residue: '1' },
    };

    private static readonly ANY_SERVICE_ITEM: Service = {
        id: '0',
        name: t('PunchCard.AnyService'),
        description: '',
        price: 0,
        groupId: null,
        groupName: '',
    };

    constructor(
        showToast: (message: string, type: 'success' | 'error') => void,
        navigate: (path: string) => void,
        queryClient: QueryClient,
    ) {
        this.serviceList = [];
        this.queryClient = queryClient;
        this.toast = showToast;
        this.navigate = navigate;
    }

    private static flattenAndFormat(data: ServiceGroup[]): Service[] {
        if (!Array.isArray(data)) return [this.ANY_SERVICE_ITEM];

        const rawData = data.flatMap((group) => {
            const groupId = group.id || null;
            const groupName = group.group || '';

            if (!Array.isArray(group.services)) return [];

            return group.services.map((service: Service) => ({
                id: service?.id?.toString() || '',
                name: service?.name || '',
                description: service?.description || '',
                groupId,
                groupName,
                price: +service?.price || 0,
            }));
        });

        return [this.ANY_SERVICE_ITEM, ...rawData];
    }

    async GetServicesList({ setServiceList, setLoadingServices }: GetServicesListParams) {
        try {
            setLoadingServices?.(true);
            const response = await GetServiceGroup();
            const formatted = PunchCardApi.flattenAndFormat(response?.data?.data || []);
            this.serviceList = formatted;
            setServiceList?.(this.serviceList);
            return this.serviceList;
        } catch (error) {
            console.error('Error fetching service list:', error);
            throw error;
        } finally {
            setLoadingServices?.(false);
        }
    }

    async CreatePunchCard({ payload }: { payload: PostApiBundleOffersBody }) {
        try {
            const response = await api.postApiBundleOffers(payload);
            this.queryClient.invalidateQueries({ queryKey: ['punchCardList'] });
            this.toast(t('PunchCard.PunchCardCreatedSuccessfully'), 'success');
            setTimeout(() => {
                this.navigate('/punch-card');
            }, 3000);
            return response;
        } catch (error: any) {
            console.error('Error creating punch card:', error);
            if (error?.response?.data?.message) {
                this.toast(error?.response?.data?.message, 'error');
            } else {
                this.toast(t('PunchCard.FailedToCreatePunchCard'), 'error');
            }
            setTimeout(() => {
                this.navigate('/punch-card');
            }, 3000);
            return error;
        }
    }

    async UpdatePunchCard({ id, payload }: { id: string; payload: PostApiBundleOffersBody }) {
        try {
            const response = await api.putApiBundleOffersId(id, payload);
            this.queryClient.invalidateQueries({ queryKey: ['punchCardList'] });
            this.toast(t('PunchCard.PunchCardUpdatedSuccessfully'), 'success');
            setTimeout(() => {
                this.navigate('/punch-card');
            }, 3000);
            return response;
        } catch (error) {
            console.error('Error updating punch card:', error);
            this.toast(t('PunchCard.FailedToUpdatePunchCard'), 'error');
            setTimeout(() => {
                this.navigate('/punch-card');
            }, 3000);
            return error;
        }
    }

    async GetPunchCardById(
        id: string,
        setInitialValues: React.Dispatch<React.SetStateAction<PunchCardFormikValues>>,
        setLoadingPunchCard: React.Dispatch<React.SetStateAction<boolean>>,
    ) {
        try {
            setLoadingPunchCard(true);
            const response = await api.getApiBundleOffersId(id);
            const bundleType = response?.bundleOfferType || 'PUNCH_BASED';

            const services = response?.applicableService?.services;
            const formattedServices: Record<string, any> =
                typeof services === 'object' && services !== null
                    ? Object.fromEntries(
                          Object.entries(services).map(([key, service]: [string, any]) => {
                              if (bundleType === 'PUNCH_BASED') {
                                  return [key, { name: service.name }];
                              } else {
                                  return [
                                      key,
                                      {
                                          ...service,
                                          original: service.original?.toString() ?? '0',
                                          residue: service.residue?.toString() ?? '0',
                                      },
                                  ];
                              }
                          }),
                      )
                    : PunchCardApi.defaultValue;

            const newValues: PunchCardFormikValues = {
                name: response?.name || '',
                description: response?.description || '',
                expiryMonths: response?.expiryMonths || 1,
                bundleOfferType: bundleType,
                price: response?.price?.toString() || '1',
                applicableService: {
                    services: formattedServices,
                    residuePunch: response?.applicableService?.residuePunch?.toString() || '1',
                    originalPunch: response?.applicableService?.originalPunch?.toString() || '1',
                },
                sellOnline: response?.sellOnline || false,
            };

            setInitialValues(newValues);
        } catch (error) {
            console.error('Error fetching punch card by ID:', error);
            this.toast(t('PunchCard.InvalidPunchCard'), 'error');
            setTimeout(() => {
                this.navigate('/punch-card');
            }, 3000);
            return error;
        } finally {
            setLoadingPunchCard(false);
        }
    }
}
