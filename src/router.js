import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginFlow from './scenes/LoginForm';
import ProtectedRoute from './protectedRoute';
import AddCustomerForm from './scenes/Coustmer';
import CustomerDetail from './scenes/Coustmer/customerDetail';

// Customer Detail Components
import CustomerInformation from './components/customer/customerDetail/Customer-Information';
import ProductSales from './components/customer/customerDetail/ProductSales';
import PunchCardsCustomer from './components/customer/customerDetail/Punch-Cards';
import GiftCardsCustomer from './components/customer/customerDetail/Gift-Cards';

// Settings
import EmployeeSettingsOption from './components/settings/employee';

// Settings
import SettingsLayout from './scenes/settigs/settings.index';

// POS
import POSLayout from './scenes/POS/POS.layout';

// POS - Products
import POSProducts from './scenes/POS/UI/Product-Page/product.index';
import POSProductForm from './scenes/POS/UI/Product-Page/UI/Forms/POSProductForm';

// POS - Expenses
import ExpenseLayout from './scenes/POS/UI/Expense-Page/expense.index';

// POS - Suppliers
import POSSupplier from './scenes/POS/UI/Supplier-Page/supplier.index';
import POSSupplierForm from './scenes/POS/UI/Supplier-Page/UI/Create/POSSupplierForm';

// POS - Sales
import SalesPageLayout from './scenes/POS/UI/Sales-Page/sales.index';

// POS - CashDrawer
import CashDrawerLayout from './scenes/POS/UI/CashDrawer/cash-drawer.layout';

// POS - Settings
import PosSettings from './scenes/POS/UI/Pos-settings/Pos-settings.index';

// GiftCard
import GiftCardLayout from './scenes/GIftCard/GiftCard.layout';
import GiftCardPageLayout from './scenes/GIftCard/UI/Gift-card/GiftCardPage.layout';
import GiftCardSettingsLayout from './scenes/GIftCard/UI/GIftCardSettings/GiftCardSettings.layout';
import UpdateGiftCardPageLayout from './scenes/GIftCard/UI/UpdateGiftCard/UpdateGiftCardPage.layout';

// PunchCard
import PunchCardLayout from './scenes/PunchCard/PunchCard.layout';
import PunchCard from './scenes/PunchCard/PAGES/punch-card/PunchCard.index';
import PunchCardSettings from './scenes/PunchCard/PAGES/punch-card-settings/PunchCardSettings.index';
import PunchCardFrom from './scenes/PunchCard/PAGES/punch-card/UI/Create-Edit/PunchCardFrom';
import PunchCardUsage from './scenes/PunchCard/PAGES/punch-card-usage/punch-card-usage.index';
import SoldPunchCards from './scenes/PunchCard/PAGES/punch-card-sold/punch-card-sold.index';
import EditSoldPunchCard from './scenes/PunchCard/PAGES/punch-card-sold/Create-Edit/EditSoldPunchCard';

import Unauthorized from './scenes/Unauthorized/Unauthorized';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <LoginFlow />,
            },
            {
                path: 'unauthorized',
                element: <Unauthorized />,
            },
            {
                path: 'customers',
                element: <ProtectedRoute element={<AddCustomerForm />} />,
            },
            {
                path: 'settings',
                element: <ProtectedRoute element={<SettingsLayout />} />,
            },
            {
                path: 'customers/:id',
                element: <ProtectedRoute element={<CustomerDetail />} />,
                children: [
                    {
                        path: 'customerinformation',
                        element: <ProtectedRoute element={<CustomerInformation />} />,
                    },
                    {
                        path: '',
                        element: <ProtectedRoute element={<CustomerInformation />} />,
                    },
                    {
                        path: 'products',
                        element: <ProtectedRoute element={<ProductSales />} />,
                    },
                    {
                        path: 'gift-cards',
                        element: <ProtectedRoute element={<GiftCardsCustomer />} />,
                    },
                    {
                        path: 'punch-cards',
                        element: <ProtectedRoute element={<PunchCardsCustomer />} />,
                    },
                ],
            },
            {
                path: 'employees',
                element: <ProtectedRoute element={<EmployeeSettingsOption />} />,
            },
            {
                path: 'pos',
                element: <ProtectedRoute element={<POSLayout />} />,
                children: [
                    {
                        path: 'products',
                        element: <ProtectedRoute element={<POSProducts />} />,
                    },
                    {
                        path: 'products/:id',
                        element: <ProtectedRoute element={<POSProductForm />} />,
                    },
                    {
                        path: 'suppliers',
                        element: <ProtectedRoute element={<POSSupplier />} />,
                    },
                    {
                        path: 'suppliers/:id',
                        element: <ProtectedRoute element={<POSSupplierForm />} />,
                    },
                    {
                        path: 'sales',
                        element: <ProtectedRoute element={<SalesPageLayout />} />,
                    },
                    {
                        path: 'expenses',
                        element: <ProtectedRoute element={<ExpenseLayout />} />,
                    },
                    {
                        path: 'cashdrawer',
                        element: <ProtectedRoute element={<CashDrawerLayout />} />,
                    },
                    {
                        path: 'settings',
                        element: <ProtectedRoute element={<PosSettings />} />,
                    },
                ],
            },
            {
                path: 'gift-card',
                element: <ProtectedRoute element={<GiftCardLayout />} />,
                children: [
                    {
                        path: '',
                        element: <ProtectedRoute element={<GiftCardPageLayout />} />,
                    },
                    {
                        path: 'update/:id',
                        element: <ProtectedRoute element={<UpdateGiftCardPageLayout />} />,
                    },
                    {
                        path: 'settings',
                        element: <ProtectedRoute element={<GiftCardSettingsLayout />} />,
                    },
                ],
            },
            {
                path: 'punch-card',
                element: <ProtectedRoute element={<PunchCardLayout />} />,
                children: [
                    {
                        path: 'list',
                        element: <ProtectedRoute element={<PunchCard />} />,
                    },
                    {
                        path: 'settings',
                        element: <ProtectedRoute element={<PunchCardSettings />} />,
                    },
                    {
                        path: ':id',
                        element: <ProtectedRoute element={<PunchCardFrom />} />,
                    },
                    {
                        path: 'usage/:id',
                        element: <ProtectedRoute element={<PunchCardUsage />} />,
                    },
                    {
                        path: 'sold/:id?',
                        element: <ProtectedRoute element={<SoldPunchCards />} />,
                    },
                    {
                        path: 'sold/:id/edit',
                        element: <ProtectedRoute element={<EditSoldPunchCard />} />,
                    },
                ],
            },
            {
                path: '/*',
                element: <Navigate to="/customers" />,
            },
        ],
    },
]);
