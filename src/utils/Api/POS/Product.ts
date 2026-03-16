import { CancelTokenSource } from 'axios';
import { api } from '.';
import {
    GetApiProductsListingParams,
    PostApiProductBody,
    PostApiProductCategories201,
    PostApiProductCategoriesBody,
    PutApiProductCategoriesIdBody,
    PutApiProductIdBody,
    PutApiUpdateProductsBodyDataItem,
} from '../../../shared/api/models';
import axios from 'axios';

export const GetProductsListingApi = async ({
    params,
    cancelToken,
}: {
    params: GetApiProductsListingParams;
    cancelToken?: CancelTokenSource;
}) => {
    try {
        if (cancelToken?.token?.reason) {
            throw new axios.Cancel('Request cancelled');
        }

        const response = await api.getApiProductsListing(params, {
            cancelToken: cancelToken?.token,
        });
        return response;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request cancelled:', error.message);
        }
        throw error;
    }
};

export const CreateCategoryApi = async ({ body }: { body: PostApiProductCategoriesBody }) => {
    try {
        const response = await api.postApiProductCategories(body as PostApiProductCategoriesBody);
        return response;
    } catch (error) {
        throw error;
    }
};

export const UpdateCategoryApi = async ({ id, body }: { id: string; body: PostApiProductCategories201 }) => {
    try {
        const response = await api.putApiProductCategoriesId(id, body as PutApiProductCategoriesIdBody);
        return response;
    } catch (error) {
        throw error;
    }
};

export const DeleteCategoryApi = async ({ id }: { id: string }) => {
    try {
        const response = await api.deleteApiProductCategoriesId(id);
        return response;
    } catch (error) {
        throw error;
    }
};

export const GetProductByIdApi = async (id: string) => {
    try {
        const response = await api.getApiProductsId(id);
        return response;
    } catch (error) {
        throw error;
    }
};

export const CreateProductApi = async ({ body }: { body: PostApiProductBody }) => {
    try {
        const response = await api.postApiProduct(body);
        return response;
    } catch (error) {
        throw error;
    }
};

export const UpdateProductApi = async ({ id, body }: { id: string; body: PutApiProductIdBody }) => {
    try {
        const response = await api.putApiProductId(id, body);
        return response;
    } catch (error) {
        throw error;
    }
};

export const DeleteProductApi = async ({ ids }: { ids: Array<string> }) => {
    try {
        const response = await api.deleteApiProducts({ ids });
        return response;
    } catch (error) {
        throw error;
    }
};

export const GetCategoriesApi = async () => {
    try {
        const response = await api.getApiProductCategories();
        return response;
    } catch (error) {
        throw error;
    }
};

export const UpdateMultiProductApi = async ({ body }: { body: PutApiUpdateProductsBodyDataItem[] }) => {
    try {
        const response = await api.putApiUpdateProducts({ data: body });
        return response;
    } catch (error) {
        throw error;
    }
};
