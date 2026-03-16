import {
    CreateSupplierApi,
    DeleteSupplierApi,
    GetSupplierApi,
    GetSupplierByIdApi,
    UpdateSupplierApi,
} from '@/utils/Api/POS/Supplier';
import { t } from 'i18next';
import {
    GetApiListSuppliers200Item,
    PostApiSupplier201,
    PostApiSupplierBody,
    PutApiSupplierId200,
    PutApiSupplierIdBody,
} from '@/shared/api/models';
import { ToastSchema } from '@/scenes/POS/Types';
import { QueryClient } from '@tanstack/react-query';

export class SupplierApi {
    async GetSupplier({
        setSuppliers,
        showToast,
        setLoading = () => {},
    }: {
        setSuppliers: React.Dispatch<React.SetStateAction<GetApiListSuppliers200Item[] | null>>;
        showToast: ToastSchema;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    }) {
        try {
            setLoading(true);
            const response = (await GetSupplierApi()) as GetApiListSuppliers200Item[];
            setSuppliers(response ?? []);
        } catch (error) {
            showToast(t('POS.ToastErrGetSupp'), 'error');
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    }

    async GetSupplierById({
        id,
        showToast,
        navigate,
        setFormikValues,
        setLoading = () => {},
    }: {
        id: string;
        showToast: ToastSchema;
        navigate: (path: string) => void;
        setFormikValues: (values: PutApiSupplierId200) => void;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    }) {
        try {
            setLoading(true);
            const response = await GetSupplierByIdApi({ id });
            setFormikValues(response);
        } catch (error) {
            showToast(t('POS.ToastErrGetSupp'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            });
            return () => clearTimeout(interval);
        } finally {
            setLoading(false);
        }
    }

    async CreateSupplier({
        body,
        showToast,
        setLoading = () => {},
        navigate,
        queryClient,
    }: {
        body: PostApiSupplierBody;
        showToast: ToastSchema;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
        navigate: (path: string) => void;
        queryClient?: QueryClient;
    }) {
        try {
            setLoading(true);
            (await CreateSupplierApi({ body })) as PostApiSupplier201;
            showToast(t('POS.ToastSuccSupCr'), 'success');
            await queryClient?.invalidateQueries({ queryKey: ['supplier'] });
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } catch (error) {
            showToast(t('POS.ToastErrGetSupp'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } finally {
            setLoading(false);
        }
    }

    async UpdateSupplier({
        id,
        body,
        showToast,
        setLoading = () => {},
        navigate,
        queryClient,
    }: {
        id: string;
        body: PutApiSupplierIdBody;
        showToast: ToastSchema;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
        navigate: (path: string) => void;
        queryClient: QueryClient;
    }) {
        try {
            setLoading(true);
            await UpdateSupplierApi({ id, body });
            showToast(t('POS.ToastSuccSupUp'), 'success');
            await queryClient.invalidateQueries({ queryKey: ['supplier'] });
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } catch (error) {
            showToast(t('POS.ToastErrSupUp'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } finally {
            setLoading(false);
        }
    }

    async DeleteSupplier({
        id,
        showToast,
        setLoading = () => {},
        navigate,
        queryClient,
    }: {
        id: string;
        showToast: ToastSchema;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
        navigate: (path: string) => void;
        queryClient: QueryClient;
    }) {
        try {
            setLoading(true);
            await DeleteSupplierApi({ id });
            showToast(t('POS.ToastSuccDelSupp'), 'success');
            await queryClient.invalidateQueries({ queryKey: ['supplier'] });
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } catch (error) {
            showToast(t('POS.ToastErrDelSupp'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/suppliers');
            }, 1500);
            return () => clearTimeout(interval);
        } finally {
            setLoading(false);
        }
    }
}

export const supplierApi = new SupplierApi();
