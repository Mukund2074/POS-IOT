export type PosSetting = {
    settingCategory: string;
    settingName: string;
    value: string;
    type: string;
};

// Permission CRUD flags
interface CrudPermission {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
}

// All resource types for employees
interface EmployeeResourcePermissions {
    Product?: CrudPermission;
    Supplier?: CrudPermission;
    Category?: CrudPermission;
    Expense?: CrudPermission;
    Sales?: CrudPermission;
    GiftCard?: CrudPermission;
    CashDrawer?: {
        read?: boolean;
        update?: boolean;
    };
    GiftCardSettings?: {
        update?: boolean;
    };
    PunchCard?: CrudPermission;
    PunchCardSettings?: {
        update?: boolean;
    };
}

// Permissions mapped by employee ID
interface EmployeePermissions {
    [employeeId: string]: EmployeeResourcePermissions;
}

// Cash Drawer print settings
interface PrintCashDrawer {
    showCountOnPrint: boolean;
    showPaymentSpecification: boolean;
    showPaymentMethods: boolean;
}

// Rounding settings
interface RoundingAmount {
    roundDiscount: boolean;
}

// General setup settings
interface GeneralSetup {
    votingType?: 'DEPARTMENT' | 'EMPLOYEE' | 'STANDARD' | string; // extend as needed
    forceEmployeeVote?: boolean;
    hideLastCount: boolean;
}

// Terminal configuration settings
interface TerminalConfiguration {
    terminalIp: string;
    terminalPort: number;
}

// Payment options settings
interface PaymentOptions {
    card: boolean;
    cardTerminal?: boolean;
    bankTransfer: boolean;
    mobilePay: boolean;
}

// Cash drawer specific permissions
interface CashDrawerPermissions {
    printCashDrawer: PrintCashDrawer;
    roundingAmount: RoundingAmount;
    generalSetup: GeneralSetup;
}

// Root settings object
export interface Settings {
    sendEmailReceipt: boolean;
    employeePermissions: EmployeePermissions;
    cashDrawerPermissions: CashDrawerPermissions;
    terminalConfiguration: TerminalConfiguration;
    paymentOptions: PaymentOptions;
}
