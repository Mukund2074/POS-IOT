import {
    GetApiProductCategories200Item,
    GetApiProductsListing200ProductsItem,
    GetApiProductsListing200ProductsItemProductsItem,
} from '@/shared/api/models';

class ProductHandler {
    async CategoryClick({
        category,
        selectedCategory,
        selectedProduct,
        setSelectedCategory,
        setSelectedProduct,
    }: {
        category: GetApiProductsListing200ProductsItem;
        selectedCategory: GetApiProductCategories200Item[];
        selectedProduct: GetApiProductsListing200ProductsItemProductsItem[];
        setSelectedCategory: React.Dispatch<React.SetStateAction<GetApiProductCategories200Item[]>>;
        setSelectedProduct: React.Dispatch<React.SetStateAction<GetApiProductsListing200ProductsItemProductsItem[]>>;
    }) {
        const isSelected = selectedCategory.some((c) => c.id === category.id);

        if (isSelected) {
            // Deselect category and its products
            setSelectedCategory(selectedCategory.filter((c) => c.id !== category.id));
            setSelectedProduct(selectedProduct.filter((p) => p.categoryId !== category.id));
        } else {
            // Select category and all its products
            setSelectedCategory([...selectedCategory, category]);

            const categoryProducts = category.products ?? [];
            const newProducts = categoryProducts.filter(
                (prod: GetApiProductsListing200ProductsItemProductsItem) =>
                    !selectedProduct.some((p) => p.id === prod.id),
            );
            setSelectedProduct([...selectedProduct, ...newProducts]);
        }
    }

    async ProductClick({
        product,
        selectedCategory,
        selectedProduct,
        setSelectedCategory,
        setSelectedProduct,
        categories,
    }: {
        product: GetApiProductsListing200ProductsItemProductsItem;
        selectedCategory: GetApiProductCategories200Item[];
        selectedProduct: GetApiProductsListing200ProductsItemProductsItem[];
        setSelectedCategory: React.Dispatch<React.SetStateAction<GetApiProductCategories200Item[]>>;
        setSelectedProduct: React.Dispatch<React.SetStateAction<GetApiProductsListing200ProductsItemProductsItem[]>>;
        categories: GetApiProductsListing200ProductsItem[];
    }) {
        const isSelected = selectedProduct.some((p) => p.id === product.id);

        let updatedProducts: GetApiProductsListing200ProductsItemProductsItem[];
        if (isSelected) {
            updatedProducts = selectedProduct.filter((p) => p.id !== product.id);
        } else {
            updatedProducts = [...selectedProduct, product];
        }
        setSelectedProduct(updatedProducts);

        // Check if all products in category are selected
        const category = categories.find((cat) => cat.id === product.categoryId);
        const allCategoryProducts = category?.products ?? [];
        const allSelected = allCategoryProducts.every((p) => updatedProducts.some((sp) => sp.id === p.id));

        const categoryAlreadySelected = selectedCategory.some((c) => c.id === product.categoryId);
        if (allSelected && !categoryAlreadySelected && category) {
            setSelectedCategory([...selectedCategory, category]);
        } else if (!allSelected && categoryAlreadySelected) {
            setSelectedCategory(selectedCategory.filter((c) => c.id !== product.categoryId));
        }
    }

    async EditCategory({
        category,
        setCategoryToEdit,
        handleModalOpen,
    }: {
        category: GetApiProductCategories200Item;
        setCategoryToEdit: React.Dispatch<React.SetStateAction<GetApiProductCategories200Item | null>>;
        handleModalOpen: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    }) {
        setCategoryToEdit(category);
        handleModalOpen((prev) => ({ ...prev, categoryModal: true }));
    }
}

export const productHandler = new ProductHandler();
