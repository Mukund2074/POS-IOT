import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginFlow from './scenes/LoginForm';
import ProtectedRoute from './protectedRoute';
import CustomCalendar from './scenes/Calendar';
import AddCustomerForm from './scenes/Coustmer';
import CustomerDetail from './scenes/Coustmer/customerDetail';
import PublicBooking from './scenes/PublicBooking';

import HistoryTable from './scenes/History';
import Specialoffers from './scenes/Specialoffers';
import InsightsPage from './scenes/Insights';

// Customer Detail Components
import Bookings from './components/customer/customerDetail/Bookings';
import CustomerInformation from './components/customer/customerDetail/Customer-Information';
import JournalGroups from './components/customer/customerDetail/journal_groups';
import AdvancedJournal from './components/customer/customerDetail/Advanced-journal';
import SalesListCustomer from './components/customer/customerDetail/Sales';
import ProductSales from './components/customer/customerDetail/ProductSales';
import PunchCardsCustomer from './components/customer/customerDetail/Punch-Cards';
import GiftCardsCustomer from './components/customer/customerDetail/Gift-Cards';

// Settings
import SettingsLayout from './scenes/Settings/settigs.layout';
import AdvanceJournalGroupSettingsOption from './components/settings/advanceJournal';
import JournalGroupSettingsOption from './components/settings/journalGroup';
import OpeningHours from './components/settings/opningHours';
import EmployeeSettingsOption from './components/settings/employee';
import EmployeeSettingsOptionBeta from './components/settings/employee/index.updated';
import CalendarSettingsOption from './components/settings/calendar';
import OnlineBookingSettingsOption from './components/settings/onlineBooking';
import GeneralSettingsOption from './components/settings/general';

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
import IntegrationPage from './scenes/Settings/Integrations/integration.index';
import IntegrationLayout from './scenes/Settings/Integrations/integration.layout';
import DineroBox from './scenes/Settings/Integrations/UI/List/POSDinero';
import BillyBox from './scenes/Settings/Integrations/UI/List/POSBilly';
import EconomicBox from './scenes/Settings/Integrations/UI/List/POSEconomic';
import POSTrustpilot from './scenes/Settings/Integrations/UI/List/RatingAndReview/POSTrustpilot';
import POSKlaviyo from './scenes/Settings/Integrations/UI/List/CRM/POSKlaviyo';
import POSWebhook from './scenes/Settings/Integrations/UI/List/CRM/POSWebhook';
import GoogleCalendar from './scenes/Settings/Integrations/UI/List/SyncBooking/GoogleCalendar';
import Calendly from './scenes/Settings/Integrations/UI/List/SyncBooking/Calendly';

// POS - Report
import Report from './scenes/POS/UI/Report/report.index';
import ReportSales from './scenes/POS/UI/Report/List/ReportSales';
import ReportSection from './scenes/POS/UI/Report/List/ReportSection';
import WeeklyRevenue from './scenes/POS/UI/Report/UI/Sales/WeeklyRevenue';
import StockStatus from './scenes/POS/UI/Report/UI/Sales/StockStatus';
import ServiceSales from './scenes/POS/UI/Report/UI/Sales/ServiceSales';
import PaymentMethod from './scenes/POS/UI/Report/UI/Sales/PaymentMethod';
import ActiveGiftCard from './scenes/POS/UI/Report/UI/Sales/ActiveGiftCard';
import ActiveClippingCard from './scenes/POS/UI/Report/UI/Sales/ActiveClippingCard';
import VatMethod from './scenes/POS/UI/Report/UI/Sales/VATmethod';
import ProductSale from './scenes/POS/UI/Report/UI/Sales/ProductSales';

// POS - Customer
import UniqueCustomer from './scenes/POS/UI/Report/UI/Customer/UniqueCustomer';
import TopCustomers from './scenes/POS/UI/Report/UI/Customer/TopCustomer';
import CustomerByPostal from './scenes/POS/UI/Report/UI/Customer/CustomerByPostal';
import NewCustomers from './scenes/POS/UI/Report/UI/Customer/NewCustomers';
import ExcludedFromBooking from './scenes/POS/UI/Report/UI/Customer/ExcludedFromBooking';
import Outstanding from './scenes/POS/UI/Report/UI/Customer/Outstanding';
import Receivables from './scenes/POS/UI/Report/UI/Customer/Receivables';
import HealthDeclationBookingList from './components/customer/customerDetail/HealthDeclarationBookingList/HealthDeclationBookingList';

// GiftCard
import GiftCardLayout from './scenes/GIftCard/GiftCard.layout';
import GiftCardPageLayout from './scenes/GIftCard/UI/Gift-card/GiftCardPage.layout';
import GiftCardSettingsLayout from './scenes/GIftCard/UI/GIftCardSettings/GiftCardSettings.layout';
import UpdateGiftCardPageLayout from './scenes/GIftCard/UI/UpdateGiftCard/UpdateGiftCardPage.layout';
import OnlineGiftCardLayout from './scenes/GIftCard/UI/OnlineGiftCard/OnlineGiftCard.layout';
import OnlineGiftCardsForm from './scenes/GIftCard/UI/OnlineGiftCard/UI/OnlineGiftCardForm';
import OnlineGiftCards from './scenes/GIftCard/UI/OnlineGiftCard/UI/OnlineGiftCards';

// PunchCard
import PunchCardLayout from './scenes/PunchCard/PunchCard.layout';
import PunchCard from './scenes/PunchCard/PAGES/punch-card/PunchCard.index';
import PunchCardSettings from './scenes/PunchCard/PAGES/punch-card-settings/PunchCardSettings.index';
import PunchCardFrom from './scenes/PunchCard/PAGES/punch-card/UI/Create-Edit/PunchCardFrom';
import PunchCardUsage from './scenes/PunchCard/PAGES/punch-card-usage/punch-card-usage.index';
import SoldPunchCards from './scenes/PunchCard/PAGES/punch-card-sold/punch-card-sold.index';
import EditSoldPunchCard from './scenes/PunchCard/PAGES/punch-card-sold/Create-Edit/EditSoldPunchCard';

// Statistics
import Statistics from './scenes/Statistics';
import AppointmentsList from './scenes/Statistics/appointments/list';
import AppointmentsCount from './scenes/Statistics/appointments/count';
import AppointmentsTime from './scenes/Statistics/appointments/time';
import AppointmentsRevenue from './scenes/Statistics/appointments/revenue';
import AppointmentsServices from './scenes/Statistics/appointments/services';
import AppointmentsAppointmentTimes from './scenes/Statistics/appointments/appointment-times';
import CashRegisterSales from './scenes/Statistics/cash-register/sales';
import CashRegisterSalesSummary from './scenes/Statistics/cash-register/salesSummary';
import ClipCardSummary from './scenes/Statistics/clip-card';

// Services
import Deposit from './scenes/Services/Deposit/Deposit';
import ServiceLayout from './scenes/Services/Services.layout';
import Services from './scenes/Services/index';
import Subscription from './components/customer/customerDetail/Subscription/Subscription';
import HealthDeclarationIndex from './scenes/Services/Health-Declaration/HealthDeclaration.index';
import HealthDeclarationForm from './scenes/Services/Health-Declaration/HealthDeclarationForm';
import AdvanceReminder from './scenes/Services/AdvanceReminder/AdvanceReminder';

// Marketing
import MarketingLayout from './scenes/Marketing/Marketing.layout';
import MarketingOverview from './scenes/Marketing/Overview/MarketingOverview.index';
import EmailCampaigns from './scenes/Marketing/EmailCampaigns/EmailCampaigns.index';
import EmailCampaignsLayout from './scenes/Marketing/EmailCampaigns/EmailCampaigns.layout';
import EmailCampaignWizard from './scenes/Marketing/EmailCampaigns/EmailCampaignWizard';
import SMSCampaigns from './scenes/Marketing/SMSCampaigns/SMSCampaigns.index';
import SMSCampaignsLayout from './scenes/Marketing/SMSCampaigns/SMSCampaigns.layout';
import SMSCampaignWizard from './scenes/Marketing/SMSCampaigns/SMSCampaignWizard';
import TriggerFlowsLayout from './scenes/Marketing/TriggerFlaws/TriggerFlows.layout';
import TriggerFlawsIndex from './scenes/Marketing/TriggerFlaws/TriggerFlaws.index';
import SelectTriggerFlow from './scenes/Marketing/TriggerFlaws/SelectTriggerFlow/SelectTriggerFlow.index';
import TriggerBuilder from './scenes/Marketing/TriggerFlaws/TriggerBuilder/TriggerBuilder.index';
import DoctorsLayout from './scenes/Doctors/Doctors.layout';
import DoctorsList from './scenes/Doctors/DoctorsList/DoctorsList';
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
                path: 'booking/:token',
                element: <PublicBooking />,
            },
            {
                path: 'unauthorized',
                element: <Unauthorized />,
            },
            {
                path: 'calendar',
                element: <ProtectedRoute element={<CustomCalendar />} />,
            },
            {
                path: 'customers',
                element: <ProtectedRoute element={<AddCustomerForm />} />,
            },
            {
                path: 'customers/:id',
                element: <ProtectedRoute element={<CustomerDetail />} />,
                children: [
                    {
                        path: 'bookings',
                        element: <ProtectedRoute element={<Bookings />} />,
                    },
                    {
                        path: 'customerinformation',
                        element: <ProtectedRoute element={<CustomerInformation />} />,
                    },
                    {
                        path: 'journalgroups',
                        element: <ProtectedRoute element={<JournalGroups />} />,
                    },
                    {
                        path: 'advancedjournal',
                        element: <ProtectedRoute element={<AdvancedJournal />} />,
                    },
                    {
                        path: '',
                        element: <ProtectedRoute element={<CustomerInformation />} />,
                    },
                    {
                        path: 'sales',
                        element: <ProtectedRoute element={<SalesListCustomer />} />,
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
                    {
                        path: 'subscription',
                        element: <ProtectedRoute element={<Subscription />} />,
                    },
                    {
                        path: 'health-declaration-booking',
                        element: <ProtectedRoute element={<HealthDeclationBookingList />} />,
                    },
                ],
            },
            {
                path: 'history',
                element: <ProtectedRoute element={<HistoryTable />} />,
            },
            {
                path: 'services',
                element: <ProtectedRoute element={<ServiceLayout />} />,
                children: [
                    {
                        path: 'deposit',
                        element: <Deposit />,
                    },
                    {
                        path: 'health-declaration-template',
                        element: <ProtectedRoute element={<HealthDeclarationIndex />} />,
                    },
                    {
                        path: 'health-declaration-template/:id',
                        element: <ProtectedRoute element={<HealthDeclarationForm />} />,
                    },
                    {
                        index: true,
                        element: <Services />,
                    },
                    {
                        path: 'advanced-reminder-templates',
                        element: <ProtectedRoute element={<AdvanceReminder />} />,
                    },
                ],
            },
            {
                path: 'specialOffers',
                element: <ProtectedRoute element={<Specialoffers />} />,
            },
            {
                path: 'settings',
                element: <ProtectedRoute element={<SettingsLayout />} />,
                children: [
                    {
                        path: '',
                        element: <ProtectedRoute element={<GeneralSettingsOption />} />,
                    },
                    {
                        path: 'online-booking',
                        element: <ProtectedRoute element={<OnlineBookingSettingsOption />} />,
                    },
                    {
                        path: 'calendar',
                        element: <ProtectedRoute element={<CalendarSettingsOption />} />,
                    },
                    {
                        path: 'employees',
                        element: <ProtectedRoute element={<EmployeeSettingsOption />} />,
                    },
                    {
                        path: 'employees-beta',
                        element: <ProtectedRoute element={<EmployeeSettingsOptionBeta />} />,
                    },
                    {
                        path: 'opening-hours',
                        element: <ProtectedRoute element={<OpeningHours />} />,
                    },
                    {
                        path: 'journal-groups',
                        element: <ProtectedRoute element={<JournalGroupSettingsOption />} />,
                    },
                    {
                        path: 'advanced-journals',
                        element: <ProtectedRoute element={<AdvanceJournalGroupSettingsOption />} />,
                    },
                    {
                        path: 'integration',
                        element: <ProtectedRoute element={<IntegrationLayout />} />,
                        children: [
                            {
                                path: '',
                                element: <ProtectedRoute element={<IntegrationPage />} />,
                            },
                            {
                                path: 'dinero-setup',
                                element: <ProtectedRoute element={<DineroBox />} />,
                            },
                            {
                                path: 'billy-setup',
                                element: <ProtectedRoute element={<BillyBox />} />,
                            },
                            {
                                path: 'economic-setup',
                                element: <ProtectedRoute element={<EconomicBox />} />,
                            },
                            {
                                path: 'trustpilot-setup',
                                element: <ProtectedRoute element={<POSTrustpilot />} />,
                            },
                            {
                                path: 'klaviyo-setup',
                                element: <ProtectedRoute element={<POSKlaviyo />} />,
                            },
                            {
                                path: 'webhook-setup',
                                element: <ProtectedRoute element={<POSWebhook />} />,
                            },
                            {
                                path: 'google-calendar',
                                element: <ProtectedRoute element={<GoogleCalendar />} />,
                            },
                            {
                                path: 'calendly',
                                element: <ProtectedRoute element={<Calendly />} />,
                            },
                        ],
                    },
                ],
            },
            {
                path: 'insights',
                element: <ProtectedRoute element={<InsightsPage />} />,
            },
            {
                path: 'pos',
                element: <ProtectedRoute element={<POSLayout />} />,
                children: [
                    {
                        path: 'report',
                        element: <ProtectedRoute element={<Report />} />,
                        children: [
                            {
                                path: 'sales',
                                element: <ProtectedRoute element={<ReportSales />} />,
                            },
                            {
                                path: 'allreport',
                                element: <ProtectedRoute element={<ReportSection />} />,
                            },
                            {
                                path: 'sales/weekly-revenue',
                                element: <ProtectedRoute element={<WeeklyRevenue />} />,
                            },
                            {
                                path: 'sales/products',
                                element: <ProtectedRoute element={<ProductSale />} />,
                            },
                            {
                                path: 'sales/services',
                                element: <ProtectedRoute element={<ServiceSales />} />,
                            },
                            {
                                path: 'sales/payment-methods',
                                element: <ProtectedRoute element={<PaymentMethod />} />,
                            },
                            {
                                path: 'sales/vat',
                                element: <ProtectedRoute element={<VatMethod />} />,
                            },
                            {
                                path: 'sales/gift-cards',
                                element: <ProtectedRoute element={<ActiveGiftCard />} />,
                            },
                            {
                                path: 'sales/punch-cards',
                                element: <ProtectedRoute element={<ActiveClippingCard />} />,
                            },
                            {
                                path: 'sales/stock',
                                element: <ProtectedRoute element={<StockStatus />} />,
                            },
                            // customer routes
                            {
                                path: 'customers/unique',
                                element: <ProtectedRoute element={<UniqueCustomer />} />,
                            },
                            {
                                path: 'customers/top-100',
                                element: <ProtectedRoute element={<TopCustomers />} />,
                            },
                            {
                                path: 'customers/postal-codes',
                                element: <ProtectedRoute element={<CustomerByPostal />} />,
                            },
                            {
                                path: 'customers/new',
                                element: <ProtectedRoute element={<NewCustomers />} />,
                            },
                            {
                                path: 'customers/excluded-booking',
                                element: <ProtectedRoute element={<ExcludedFromBooking />} />,
                            },
                            {
                                path: 'customers/outstanding',
                                element: <ProtectedRoute element={<Outstanding />} />,
                            },
                            {
                                path: 'customers/receivables',
                                element: <ProtectedRoute element={<Receivables />} />,
                            },
                        ],
                    },
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
                    {
                        path: 'online',
                        element: <ProtectedRoute element={<OnlineGiftCardLayout />} />,
                        children: [
                            {
                                path: '',
                                element: <ProtectedRoute element={<OnlineGiftCards />} />,
                            },
                            {
                                path: ':id',
                                element: <ProtectedRoute element={<OnlineGiftCardsForm />} />,
                            },
                        ],
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
                path: 'statistics',
                element: <ProtectedRoute element={<Statistics />} />,
            },
            {
                path: 'statistics/appointments/list',
                element: <ProtectedRoute element={<AppointmentsList />} />,
            },
            {
                path: 'statistics/appointments/count',
                element: <ProtectedRoute element={<AppointmentsCount />} />,
            },
            {
                path: 'statistics/appointments/time',
                element: <ProtectedRoute element={<AppointmentsTime />} />,
            },
            {
                path: 'statistics/appointments/revenue',
                element: <ProtectedRoute element={<AppointmentsRevenue />} />,
            },
            {
                path: 'statistics/appointments/services',
                element: <ProtectedRoute element={<AppointmentsServices />} />,
            },
            {
                path: 'statistics/appointments/appointment-times',
                element: <ProtectedRoute element={<AppointmentsAppointmentTimes />} />,
            },
            {
                path: 'statistics/appointments/appointment-times?type=booking',
                element: <ProtectedRoute element={<AppointmentsAppointmentTimes />} />,
            },
            {
                path: 'statistics/appointments/appointment-times?noshow=true',
                element: <ProtectedRoute element={<AppointmentsCount />} />,
            },
            {
                path: 'statistics/cash-register/sales',
                element: <ProtectedRoute element={<CashRegisterSales />} />,
            },
            {
                path: 'statistics/cash-register/salesSummary',
                element: <ProtectedRoute element={<CashRegisterSalesSummary />} />,
            },

            {
                path: 'statistics/clip-card/summary',
                element: <ProtectedRoute element={<ClipCardSummary />} />,
            },
            {
                path: 'marketing',
                element: <ProtectedRoute element={<MarketingLayout />} />,
                children: [
                    {
                        index: true,
                        element: <ProtectedRoute element={<MarketingOverview />} />,
                    },
                    {
                        path: 'email-campaigns',
                        element: <ProtectedRoute element={<EmailCampaignsLayout />} />,
                        children: [
                            {
                                index: true,
                                element: <ProtectedRoute element={<EmailCampaigns />} />,
                            },
                            {
                                path: 'create',
                                element: <ProtectedRoute element={<EmailCampaignWizard />} />,
                            },
                            {
                                path: ':id',
                                element: <ProtectedRoute element={<EmailCampaignWizard />} />,
                            },
                        ],
                    },
                    {
                        path: 'sms-campaigns',
                        element: <ProtectedRoute element={<SMSCampaignsLayout />} />,
                        children: [
                            {
                                index: true,
                                element: <ProtectedRoute element={<SMSCampaigns />} />,
                            },
                            {
                                path: 'create',
                                element: <ProtectedRoute element={<SMSCampaignWizard />} />,
                            },
                            {
                                path: ':id',
                                element: <ProtectedRoute element={<SMSCampaignWizard />} />,
                            },
                        ],
                    },
                    {
                        path: 'trigger-flows',
                        element: <ProtectedRoute element={<TriggerFlowsLayout />} />,
                        children: [
                            {
                                index: true,
                                element: <ProtectedRoute element={<TriggerFlawsIndex />} />,
                            },
                            {
                                path: 'select-trigger-flow',
                                element: <ProtectedRoute element={<SelectTriggerFlow />} />,
                            },
                            {
                                path: 'builder',
                                element: <ProtectedRoute element={<TriggerBuilder />} />,
                            },
                            {
                                path: ':id',
                                element: <ProtectedRoute element={<TriggerBuilder />} />,
                            },
                        ],
                    },
                ],
            },
            {
                path: 'doctors',
                element: <ProtectedRoute element={<DoctorsLayout />} />,
                children: [
                    {
                        index: true,
                        element: <ProtectedRoute element={<DoctorsList />} />,
                    },
                ],
            },
            {
                path: '/*',
                element: <Navigate to="/calendar" />,
            },
        ],
    },
]);
