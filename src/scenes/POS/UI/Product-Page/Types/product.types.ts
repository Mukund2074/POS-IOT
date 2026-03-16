import {
    GetApiProductsListing200ProductsItemProductsItemBrand,
    GetApiProductsListing200ProductsItemProductsItemCategoryId,
    GetApiProductsListing200ProductsItemProductsItemDescription,
    GetApiProductsListing200ProductsItemProductsItemImage,
    GetApiProductsListing200ProductsItemProductsItemOutletId,
    GetApiProductsListing200ProductsItemProductsItemSku,
    GetApiProductsListing200ProductsItemProductsItemSupplierId,
} from '@/shared/api/models';

export interface ProductSchema {
    id: string; // optional
    seqId?: number | null; // optional and nullable
    name: string;
    description: string;
    image: string;
    sku: string;
    categoryId: string | null;
    supplierId: string | null;
    brand: string;
    price: number | null;
    costPrice: number | null;
    isActive?: boolean;
    availableOnline?: boolean;
    companyId?: number | null; // optional and nullable
    createdAt?: string | null; // optional and nullable
    updatedAt?: string | null; // optional and nullable
    deletedAt?: null; // optional and only accepts null
}

export interface CategorySchema {
    id: string;
    seqId: number;
    name: string;
    description: string;
    companyId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    products: ProductSchema[];
}

export interface ProductListingParamsSchema {
    page: number | null;
    limit: number | null;
    text: string | null;
}

export interface CategoryCreateSchema {
    name: string;
    description: string;
}

export interface ProductFormSchema {
    id: string;
    seqId: number;
    name: string;
    description: GetApiProductsListing200ProductsItemProductsItemDescription;
    image: GetApiProductsListing200ProductsItemProductsItemImage;
    sku: GetApiProductsListing200ProductsItemProductsItemSku;
    categoryId: GetApiProductsListing200ProductsItemProductsItemCategoryId;
    supplierId: GetApiProductsListing200ProductsItemProductsItemSupplierId;
    brand: GetApiProductsListing200ProductsItemProductsItemBrand;
    price: number | string;
    costPrice: number | string;
    isActive: boolean;
    availableOnline: boolean;
    outletId: GetApiProductsListing200ProductsItemProductsItemOutletId;
    createdAt: string;
    updatedAt: string;
    stock?: number;
    tax?: string[];
}
