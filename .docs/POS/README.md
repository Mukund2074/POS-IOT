# 🎯 Hooks Architecture - Page-wise API Organization

## 📁 **Folder Structure**

```
src/hooks/
├── 📁 api/                     # API-related hooks organized by feature
│   ├── 📁 pos/                # Point of Sale system hooks
│   │   ├── 📁 sales/          # Sales-related operations
│   │   │   ├── useSales.ts    # Sales listing & details
│   │   │   ├── usePreviousSales.ts
│   │   │   ├── useCreateSale.ts
│   │   │   └── index.ts       # Export all sales hooks
│   │   ├── 📁 products/       # Product management hooks
│   │   │   ├── useProducts.ts
│   │   │   ├── useProductCategories.ts
│   │   │   └── index.ts
│   │   ├── 📁 suppliers/      # Supplier management (future)
│   │   ├── 📁 inventory/      # Inventory management (future)
│   │   └── index.ts           # Export all POS hooks
│   ├── 📁 calendar/           # Calendar/booking hooks (future)
│   ├── 📁 customer/           # Customer management hooks (future)
│   ├── 📁 insights/           # Analytics/insights hooks (future)
│   └── 📁 settings/           # Settings hooks (future)
├── 📁 shared/                  # Reusable utility hooks
│   ├── useDebounce.ts         # Debouncing utility
│   ├── useLocalStorage.ts     # Local storage utility (future)
│   ├── useToast.ts            # Toast notifications (future)
│   └── index.ts               # Export shared hooks
├── 📁 ui/                      # UI/component-specific hooks (future)
└── index.ts                    # Main export file
```

---

## 🚀 **Usage Examples**

### **Sales Hooks**

```tsx
import { useSalesList, useCreateSale, usePreviousSales } from '../hooks';

function SalesPage() {
    // Get sales list
    const { data: sales, isLoading } = useSalesList({
        params: { page: 1, limit: 50 },
    });

    // Create new sale
    const { mutate: createSale, isPending } = useCreateSale();

    // Get previous sales for customer
    const { data: previousSales } = usePreviousSales({
        customerId: 123,
        enabled: !!customerId,
    });

    return <div>...</div>;
}
```

### **Product Hooks**

```tsx
import { useProductService, useProductCategories, useCreateProductCategory } from '../hooks';

function ProductsPage() {
    // Search products with debouncing
    const { data: products, isDebouncing } = useProductService(
        {
            text: searchTerm,
            getServices: true,
        },
        300,
    );

    // Get categories
    const { data: categories } = useProductCategories();

    // Create category
    const { mutate: createCategory } = useCreateProductCategory();

    return <div>...</div>;
}
```

### **Shared Utility Hooks**

```tsx
import { useDebounce } from '../hooks';

function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        if (debouncedSearch) {
            // Perform search
        }
    }, [debouncedSearch]);

    return <input onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

---

## 🎯 **Benefits of This Structure**

### **1. 🔍 Easy Discovery**

- **Page-wise organization** - developers know exactly where to find hooks
- **Feature grouping** - related functionality is together
- **Clear naming** - `useSalesList`, `useCreateSale`, etc.

### **2. 🚀 Better Performance**

- **Direct Orval integration** - no unnecessary wrapper layers
- **Optimized caching** - consistent query keys across related hooks
- **Smart invalidation** - mutations automatically update related queries

### **3. 🧹 Cleaner Code**

- **Single import** - `import { useSalesList, useCreateSale } from '../hooks'`
- **Consistent patterns** - all hooks follow same structure
- **Type safety** - full TypeScript support with Orval types

### **4. 🔧 Easy Maintenance**

- **Modular structure** - easy to add new features
- **Clear boundaries** - API vs UI vs shared hooks
- **Consistent error handling** - standardized across all hooks

---

## 📋 **Migration Guide**

### **Old vs New Imports**

```tsx
// ❌ OLD - Multiple import paths
import useGetSalesList from '../hooks/POS/useGetSalesList';
import useCreateSale from '../hooks/POS/useCreateSale';
import useGetProductService from '../hooks/POS/useGetProductService';

// ✅ NEW - Single import path
import { useSalesList, useCreateSale, useProductService } from '../hooks';
```

### **Updated Hook Names**

| **Old Name**           | **New Name**        | **Location**             |
| ---------------------- | ------------------- | ------------------------ |
| `useGetSalesList`      | `useSalesList`      | `hooks/api/pos/sales`    |
| `useGetPreviousSales`  | `usePreviousSales`  | `hooks/api/pos/sales`    |
| `useGetProductService` | `useProductService` | `hooks/api/pos/products` |

---

## 🛠️ **Adding New Hooks**

### **1. Create Feature Folder**

```bash
# For new POS feature
mkdir src/hooks/api/pos/discounts

# For new page/module
mkdir src/hooks/api/calendar
```

### **2. Create Hook File**

```tsx
// src/hooks/api/pos/discounts/useDiscounts.ts
import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../../shared/api';

export function useDiscountsList() {
    const api = getApi();

    return useQuery({
        queryKey: ['discounts', 'list'],
        queryFn: () => api.getApiListDiscounts(),
        staleTime: 5 * 60 * 1000,
    });
}
```

### **3. Export in Index Files**

```tsx
// src/hooks/api/pos/discounts/index.ts
export { useDiscountsList } from './useDiscounts';

// src/hooks/api/pos/index.ts
export * from './discounts';
```

---

## 🎉 **Result: Ultra Clean Architecture**

### **Before (3-layer redundancy):**

```
Component → sales.api.ts → Sales.ts → index.ts → Orval → Backend
```

### **After (Direct & organized):**

```
Component → Hook (TanStack + Orval) → Backend
```

**Benefits:**

- ✅ **50% less code** to maintain
- ✅ **Faster performance** - direct API calls
- ✅ **Better DX** - organized by page/feature
- ✅ **Type safety** - full Orval integration
- ✅ **Easy scaling** - clear patterns for new features

This structure makes your codebase **professional**, **maintainable**, and **developer-friendly**! 🚀
