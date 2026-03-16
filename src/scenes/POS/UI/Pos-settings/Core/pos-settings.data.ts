import { t } from 'i18next';

export type Module =
    | 'Product'
    | 'Supplier'
    | 'Category'
    | 'Expense'
    | 'Sales'
    | 'GiftCard'
    | 'CashDrawer'
    | 'GiftCardSettings'
    | 'PunchCard'
    | 'PunchCardSettings'
    | 'Invoice';
// | 'PaymentOptions';
export type Permission = 'create' | 'read' | 'update' | 'delete';
export type VoteingType = 'STANDARD' | 'DEPARTMENT' | 'EMPLOYEE';

export const defaultPosPermissions: Record<Module, Partial<Record<Permission, boolean>>> = {
    Product: {
        create: false,
        // read: false,
        update: false,
        delete: false,
    },
    Supplier: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    Category: {
        create: false,
        // read: false,
        update: false,
        delete: false,
    },
    Expense: {
        create: false,
        read: false,
        // update: false,
        delete: false,
    },
    Sales: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    GiftCard: {
        // create: false,
        read: false,
        update: false,
        delete: false,
    },
    CashDrawer: {
        // read: false,
        update: false,
    },
    GiftCardSettings: {
        update: false,
    },
    PunchCard: {
        create: false,
        read: false,
        update: false,
        delete: false,
    },
    PunchCardSettings: {
        update: false,
    },
    Invoice: {
        read: false,
    },
    // PaymentOptions: {
    //     update: false,
    // },
};

export const permissionDescription: Record<string, string> = {
    'GiftCard.create': t('POS.CreateGiftCardControl'),
    'GiftCard.delete': t('POS.DeleteGiftCardControl'),
    'GiftCard.update': t('POS.UpdateGiftCardControl'),
    'GiftCardSettings.update': t('POS.GiftCardSettingsControl'),
    // 'CashDrawer.update': t('POS.UpdateCashDrawerControl'),
    'PunchCardSettings.update': t('POS.PunchCardSettingControl'),
    'PunchCard.update': t('POS.UpdatePunchCardControl'),
    'PunchCard.delete': t('POS.DeletePunchCardControl'),
};

export const POS_GENERAL_SETTINGS = {
    sendEmailReceipt: false,
    employeePermissions: {
        [Number(localStorage.getItem('employee_id')) || 0]: defaultPosPermissions,
    },
    cashDrawerPermissions: {
        printCashDrawer: {
            showCountOnPrint: false,
            showPaymentSpecification: false,
            showPaymentMethods: false,
        },
        roundingAmount: {
            roundDiscount: false,
        },
        generalSetup: {
            hideLastCount: false,
        },
    },
    terminalConfiguration: {
        terminalIp: '',
        terminalPort: 0,
    },
    paymentOptions: {
        card: false,
        cardTerminal: false,
        bankTransfer: false,
        mobilePay: false,
    },
};

export const converterHash = {
    'Sales.create': t('POS.CreatrSale'),
    'Product.create': t('POS.CreatePdt'),
    'Category.create': t('POS.CreateCat'),
    'Category.update': t('POS.UpdateCat'),
    'Category.delete': t('POS.RemoveCat'),
    'Supplier.create': t('POS.CreateSupplier'),
    'Supplier.update': t('POS.EditSupplier'),
    'Supplier.delete': t('POS.RemoveSupplier'),
    'Product.delete': t('POS.RemProd'),
    'Product.update': t('POS.UpProd'),
    'Expense.create': t('POS.CreateExpense'),
    'Expense.update': t('POS.EditExpense'),
    'Expense.delete': t('POS.RemoveExpense'),
    'GiftCard.create': t('POS.SellGiftCard'),
    'GiftCard.sell': t('POS.SellGiftCard'),
    'Stock.add': t('POS.AddStock'),
    'Stock.delete': t('POS.RemStock'),
    'Sales.update': t('POS.EditSales'),
    'Sales.cancel': t('POS.CancelSale'),
    'Product.read': t('POS.ViewProds'),
    'Category.read': t('POS.ViewCats'),
    'Supplier.read': t('POS.ViewSuppliers'),
    'Expense.read': t('POS.ViewExpenses'),
    'GiftCard.read': t('POS.ViewGiftCards'),
    'Stock.read': t('POS.ViewStocks'),
    'Sales.read': t('POS.ViewSales'),
    'Sales.delete': t('POS.RemSale'),
    'GiftCard.update': t('GiftCard.EditGiftCard'),
    'GiftCard.delete': t('GiftCard.delete'),
    'CashDrawer.read': t('POS.ViewCashDrawer'),
    'CashDrawer.update': t('POS.EditCashDrawer'),
    'GiftCardSettings.update': t('GiftCard.EditGiftCard'),
    'PunchCard.create': t('PunchCard.CreatePunchCard'),
    'PunchCard.delete': t('PunchCard.RemovePunchCard'),
    'PunchCard.update': t('PunchCard.EditPunchCard'),
    'PunchCard.read': t('PunchCard.ViewPunchCards'),
    'PunchCardSettings.update': t('PunchCard.EditPunchCard'),
    'Invoice.read': t('POS.ViewInvoices'),
};

export const cashDrawerPermissions = {
    printCashDrawer: {
        showCountOnPrint: false,
        showPaymentSpecification: false,
        showPaymentMethods: false,
    },
    roundingAmount: {
        roundDiscount: false,
    },
    // generalSetup: {
    //     hideLastCount: false,
    // },
};
