import { AxiosResponse, CancelTokenSource, HttpStatusCode } from 'axios';
import {
    CreateCategoryApi,
    CreateProductApi,
    DeleteCategoryApi,
    DeleteProductApi,
    GetCategoriesApi,
    GetProductByIdApi,
    GetProductsListingApi,
    UpdateCategoryApi,
    UpdateMultiProductApi,
    UpdateProductApi,
} from '@/utils/Api/POS/Product';
import { t } from 'i18next';
import {
    GetApiProductCategories200Item,
    GetApiProductsId200,
    GetApiProductsListing200,
    GetApiProductsListingParams,
    GetApiTax200Item,
    PostApiProductBody,
    PostApiProductCategories201,
    PostApiProductCategoriesBody,
    PostApiStockBody,
    PutApiProductIdBody,
    PutApiUpdateProductsBodyDataItem,
} from '@/shared/api/models';
import axios from 'axios';
import { ToastSchema } from '@/scenes/POS/Types';
import { api } from '@/utils/Api/POS';

class ProductApi {
    async GetProductsListing({
        params,
        setApiData,
        showToast,
        setBoolState,
        isForceLoad = false,
        cancelToken,
        setLoading = () => {},
    }: {
        params: GetApiProductsListingParams;
        setApiData: React.Dispatch<React.SetStateAction<GetApiProductsListing200 | null>>;
        showToast: ToastSchema;
        setBoolState?: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
        isForceLoad?: boolean;
        cancelToken?: CancelTokenSource;
        setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    }) {
        try {
            if (cancelToken?.token?.reason) {
                throw new axios.Cancel('Request cancelled');
            }

            isForceLoad && setLoading?.(true);
            isForceLoad && setBoolState?.((prev) => ({ ...prev, isCategoryLoading: true }));

            const response = await GetProductsListingApi({ params, cancelToken });
            setApiData(response);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled:', error.message);
                return;
            }
            !cancelToken?.token && !cancelToken?.cancel && showToast(t('POS.ToastFailCatDel'), 'error');
            console.error('error', error);
        } finally {
            setBoolState?.((prev) => ({ ...prev, isCategoryLoading: false }));
            setLoading?.(false);
        }
    }

    async CreateCategory({ body, showToast }: { body: PostApiProductCategoriesBody; showToast: ToastSchema }) {
        try {
            const response = await CreateCategoryApi({ body });
            showToast(t('POS.ToastSuccCatCr'), 'success');
            return response;
        } catch (error) {
            showToast(t('POS.ToastFailCatCr'), 'error');
        }
    }

    async UpdateCategory({
        id,
        body,
        showToast,
    }: {
        id: string;
        body: PostApiProductCategories201;
        showToast: ToastSchema;
    }) {
        try {
            const response = await UpdateCategoryApi({ id, body });
            showToast(t('POS.ToastSuccCatUp'), 'success');
            return response;
        } catch (error) {
            showToast(t('POS.ToastFailCatUp'), 'error');
        }
    }

    async DeleteCategory({ id, showToast }: { id: string; showToast: ToastSchema }) {
        try {
            const response = (await DeleteCategoryApi({ id })) as AxiosResponse;
            if (response?.status === HttpStatusCode.Ok || response?.status === HttpStatusCode.Created) {
                showToast(t('POS.ToastSuccCatDel'), 'success');
                return response;
            }
        } catch (error) {
            showToast(t('POS.ToastFailCatDel'), 'error');
            console.error('error', error);
        }
    }

    async GetProductById({
        id,
        showToast,
        navigate,
        setFormikValues,
        setLoading,
        setProduct,
    }: {
        id: string;
        showToast: ToastSchema;
        navigate: (path: string) => void;
        setFormikValues: (values: GetApiProductsId200) => void;
        setLoading: React.Dispatch<React.SetStateAction<boolean>>;
        setProduct: React.Dispatch<React.SetStateAction<GetApiProductsId200 | null>>;
    }) {
        try {
            setLoading(true);
            const response = await GetProductByIdApi(id);
            setFormikValues(response);
            setProduct(response);
        } catch (error) {
            showToast(t('POS.ToastPordNotFound'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        } finally {
            setLoading(false);
        }
    }

    async CreateProduct({
        body,
        showToast,
        navigate,
        queryClient,
    }: {
        body: PostApiProductBody;
        showToast: ToastSchema;
        navigate: (path: string) => void;
        queryClient?: any;
    }) {
        try {
            await CreateProductApi({ body });
            showToast(t('POS.ToastSuccProdCr'), 'success');
            queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        } catch (error) {
            console.error('error', error);
            showToast(t('POS.ToastFailProdCr'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        }
    }

    async UpdateProduct({
        id,
        body,
        showToast,
        navigate,
        queryClient,
    }: {
        id: string;
        body: PutApiProductIdBody;
        showToast: ToastSchema;
        navigate: (path: string) => void;
        queryClient: any;
    }) {
        try {
            await UpdateProductApi({ id, body });
            showToast(t('POS.ToastSuccProdUp'), 'success');
            queryClient.invalidateQueries({ queryKey: ['products', 'services'] });
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        } catch (error) {
            console.error('error', error);
            showToast(t('POS.ToastFailProdUp'), 'error');
            const interval = setTimeout(() => {
                navigate('/pos/products');
            }, 1500);
            return () => clearTimeout(interval);
        }
    }

    async DeleteProducts({ ids, showToast }: { ids: Array<string>; showToast: ToastSchema }) {
        try {
            const response = (await DeleteProductApi({ ids })) as AxiosResponse;
            if (response?.status === HttpStatusCode.Ok || response?.status === HttpStatusCode.Created) {
                return response;
            }
        } catch (error) {
            showToast(t('POS.ToastFailProdDel'), 'error');
        }
    }

    async fetchCategories({
        setCategories,
        showToast,
    }: {
        setCategories: React.Dispatch<React.SetStateAction<GetApiProductCategories200Item[] | null>>;
        showToast: ToastSchema;
    }) {
        try {
            const response = await GetCategoriesApi();
            setCategories(response);
        } catch (error) {
            showToast(t('POS.ToastErrGetCat'), 'error');
            console.error('error', error);
        }
    }

    async updateMultiProduct({
        body,
        showToast,
    }: {
        body: PutApiUpdateProductsBodyDataItem[];
        showToast: ToastSchema;
    }) {
        try {
            const response = await UpdateMultiProductApi({ body });
            showToast(t('POS.ToastSuccProdUp'), 'success');
            return response;
        } catch (error) {
            showToast(t('POS.ToastFailProdUp'), 'error');
            console.error('error', error);
        }
    }

    async addOrRemoveStock({ body, showToast }: { body: PostApiStockBody; showToast: ToastSchema }) {
        try {
            const response = await api.postApiStock(body);
            showToast(t('POS.ToastSuccStockUp'), 'success');
            return response;
        } catch (error) {
            showToast(t('POS.ToastFailStockUp'), 'error');
            console.error('error', error);
        }
    }
}

export const productApi = new ProductApi();
