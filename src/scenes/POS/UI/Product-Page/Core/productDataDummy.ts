import {
    GetApiProductCategories200Item,
    PostApiProductBody,
    PostApiSupplierBody,
    GetApiListSuppliers200Item,
} from '@/shared/api/models';
import { productApi } from './product.api';
import { supplierApi } from '../../Supplier-Page/Core/supplier.api.';

const suppliers = [
    {
        name: 'Glow Essentials Ltd',
        countryCode: 'GB',
        email: 'info@glowessentials.co.uk',
        contactPersonPhone: '+44 20 7946 0999',
        website: 'https://glowessentials.co.uk',
        address: '10 High Street',
        city: 'London',
        country: 'United Kingdom',
        contactPersonName: 'Emma Watts',
        contactPersonEmail: 'emma@glowessentials.co.uk',
    },
    {
        name: 'ScandiWell AB',
        countryCode: 'SE',
        email: 'kontakt@scandiwell.se',
        contactPersonPhone: '+46 8 559 21000',
        website: 'https://scandiwell.se',
        address: 'Vasagatan 1',
        city: 'Stockholm',
        country: 'Sweden',
        contactPersonName: 'Lars Svensson',
        contactPersonEmail: 'lars@scandiwell.se',
    },
    {
        name: 'BioZen Naturals',
        countryCode: 'NL',
        email: 'hello@biozen.nl',
        contactPersonPhone: '+31 20 123 4567',
        website: 'https://biozen.nl',
        address: 'Keizersgracht 123',
        city: 'Amsterdam',
        country: 'Netherlands',
        contactPersonName: 'Sophie van Dijk',
        contactPersonEmail: 'sophie@biozen.nl',
    },
    {
        name: 'Beauté de Paris',
        countryCode: 'FR',
        email: 'contact@beautedeparis.fr',
        contactPersonPhone: '+33 1 42 68 53 00',
        website: 'https://beautedeparis.fr',
        address: '21 Rue de Rivoli',
        city: 'Paris',
        country: 'France',
        contactPersonName: 'Julien Moreau',
        contactPersonEmail: 'julien@beautedeparis.fr',
    },
];

export const categoriesWithProducts: {
    name: string;
    description: string;
    products: PostApiProductBody[];
}[] = [
    {
        name: 'Skincare',
        description: 'Premium skincare products for all skin types',
        products: [
            {
                name: 'Hydrating Serum',
                description: 'Deeply hydrating serum with hyaluronic acid',
                sku: 'SK001',
                brand: 'Glow Essentials Ltd',
                price: 299,
                costPrice: 150,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 50,
            },
            {
                name: 'Vitamin C Cream',
                description: 'Brightening cream with vitamin C',
                sku: 'SK002',
                brand: 'BioZen Naturals',
                price: 349,
                costPrice: 175,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 35,
            },
        ],
    },
    {
        name: 'Hair Care',
        description: 'Professional hair care products',
        products: [
            {
                name: 'Repair Shampoo',
                description: 'Repairing shampoo for damaged hair',
                sku: 'HC001',
                brand: 'ScandiWell AB',
                price: 199,
                costPrice: 100,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 40,
            },
            {
                name: 'Nourishing Conditioner',
                description: 'Deep conditioning treatment',
                sku: 'HC002',
                brand: 'Beauté de Paris',
                price: 249,
                costPrice: 125,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 45,
            },
        ],
    },
    {
        name: 'Body Care',
        description: 'Luxurious body care products',
        products: [
            {
                name: 'Body Butter',
                description: 'Rich moisturizing body butter',
                sku: 'BC001',
                brand: 'Glow Essentials Ltd',
                price: 279,
                costPrice: 140,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 30,
            },
            {
                name: 'Body Scrub',
                description: 'Exfoliating body scrub',
                sku: 'BC002',
                brand: 'BioZen Naturals',
                price: 229,
                costPrice: 115,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 25,
            },
        ],
    },
    {
        name: 'Fragrances',
        description: 'Exclusive perfumes and fragrances',
        products: [
            {
                name: 'Floral Mist',
                description: 'Light floral body mist',
                sku: 'FR001',
                brand: 'Beauté de Paris',
                price: 399,
                costPrice: 200,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 20,
            },
            {
                name: 'Nordic Scent',
                description: 'Fresh and crisp fragrance',
                sku: 'FR002',
                brand: 'ScandiWell AB',
                price: 449,
                costPrice: 225,
                isActive: true,
                availableOnline: true,
                taxIds: ['3bd81d0b-5f7c-44fc-81e8-ea980d5df320'],
                trackInventory: true,
                categoryId: null,
                supplierId: null,
                stock: 15,
            },
        ],
    },
];

export const seedAllProducts = async (
    showToast: (msg: string, type: 'success' | 'error') => void,
    navigate: (path: string) => void,
) => {
    try {
        // STEP 1: Fetch existing categories
        const existingCategories = await new Promise<GetApiProductCategories200Item[]>((resolve) => {
            productApi.fetchCategories({
                setCategories: (
                    value:
                        | GetApiProductCategories200Item[]
                        | null
                        | ((
                              prevState: GetApiProductCategories200Item[] | null,
                          ) => GetApiProductCategories200Item[] | null),
                ) => {
                    if (typeof value === 'function') {
                        resolve([]);
                    } else {
                        resolve(value ?? []);
                    }
                },
                showToast,
            });
        });

        const categoryMap: Record<string, string> = {};

        // STEP 2: Create missing categories
        for (const category of categoriesWithProducts) {
            const existing = existingCategories.find((c) => c.name === category.name);
            if (existing) {
                categoryMap[category.name] = existing.id;
                continue;
            }

            const created = await productApi.CreateCategory({
                body: {
                    name: category.name,
                    description: category.description,
                },
                showToast,
            });

            if (created) {
                categoryMap[category.name] = created.id;
            }
        }

        // STEP 3: Create suppliers
        const existingSuppliers = await new Promise<GetApiListSuppliers200Item[]>((resolve) => {
            supplierApi.GetSupplier({
                setSuppliers: (
                    value:
                        | GetApiListSuppliers200Item[]
                        | null
                        | ((prevState: GetApiListSuppliers200Item[] | null) => GetApiListSuppliers200Item[] | null),
                ) => {
                    if (typeof value === 'function') {
                        resolve([]);
                    } else {
                        resolve(value ?? []);
                    }
                },
                showToast,
            });
        });

        const supplierMap: Record<string, string> = {};

        // Map existing suppliers
        for (const supplier of existingSuppliers) {
            if (supplier.name) {
                supplierMap[supplier.name] = supplier.id;
            }
        }

        // Create missing suppliers
        for (const supplier of suppliers) {
            if (!supplierMap[supplier.name]) {
                await supplierApi.CreateSupplier({
                    body: supplier as PostApiSupplierBody,
                    showToast,
                    navigate,
                });
            }
        }

        // Fetch suppliers again to get IDs of newly created ones
        const updatedSuppliers = await new Promise<GetApiListSuppliers200Item[]>((resolve) => {
            supplierApi.GetSupplier({
                setSuppliers: (
                    value:
                        | GetApiListSuppliers200Item[]
                        | null
                        | ((prevState: GetApiListSuppliers200Item[] | null) => GetApiListSuppliers200Item[] | null),
                ) => {
                    if (typeof value === 'function') {
                        resolve([]);
                    } else {
                        resolve(value ?? []);
                    }
                },
                showToast,
            });
        });

        // Update supplier map with all suppliers
        for (const supplier of updatedSuppliers) {
            if (supplier.name) {
                supplierMap[supplier.name] = supplier.id;
            }
        }

        // STEP 4: Create products
        for (const category of categoriesWithProducts) {
            const categoryId = categoryMap[category.name];
            if (!categoryId) continue;

            for (const product of category.products) {
                const supplierId = product.brand ? supplierMap[product.brand] : undefined;
                if (!supplierId) continue;

                await productApi.CreateProduct({
                    body: {
                        ...product,
                        categoryId,
                        supplierId,
                    },
                    showToast,
                    navigate,
                });
            }
        }

        showToast('All products seeded successfully', 'success');
        navigate('/pos/products');
    } catch (error) {
        showToast('Failed to seed products', 'error');
    }
};
