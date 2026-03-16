import { api } from '.';
import {
    GetApiSupplierId200,
    PostApiSupplier201,
    PostApiSupplierBody,
    PutApiSupplierIdBody,
} from '../../../shared/api/models';

export const GetSupplierApi = async () => {
    try {
        const response = await api.getApiListSuppliers();
        return response;
    } catch (error) {
        throw error;
    }
};

export const DeleteSupplierApi = async ({ id }: { id: string }) => {
    try {
        const response = await api.deleteApiSupplierId(id);
        return response;
    } catch (error) {
        throw error;
    }
};

export const CreateSupplierApi = async ({ body }: { body: PostApiSupplierBody }) => {
    try {
        const response = (await api.postApiSupplier(body)) as PostApiSupplier201;
        return response;
    } catch (error) {
        throw error;
    }
};

export const UpdateSupplierApi = async ({ id, body }: { id: string; body: PutApiSupplierIdBody }) => {
    try {
        await api.putApiSupplierId(id, body);
    } catch (error) {
        throw error;
    }
};

export const GetSupplierByIdApi = async ({ id }: { id: string }) => {
    try {
        const response = (await api.getApiSupplierId(id)) as GetApiSupplierId200;
        return response;
    } catch (error) {
        throw error;
    }
};
