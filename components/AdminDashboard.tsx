import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { User, MenuItem, Order, OrderItem } from '../types';
import SalesDashboard from './admin/SalesDashboard';
import OrderEntry from './admin/OrderEntry';
import AdminSettings from './admin/AdminSettings';
import MenuManagement from './admin/MenuManagement';
import { ChartBarIcon, ClipboardDocumentListIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, BookOpenIcon } from './common/icons';


interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  users: User[];
  menuItems: MenuItem[];
  orders: Order[];
  onLogout: () => void;
  onPlaceOrder: (orderItems: OrderItem[], customerId: string) => void;
  onUpdateUser: (user: User) => void;
  onUpdateMenu: (menu: MenuItem[]) => void;
  onCreateAdmin: (businessName: string, username: string, password_not_safe: string) => string | null;
  onToggleAdminStatus: (adminId: string) => void;
}

type AdminTab = 'sales' | 'order' | 'menu' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    currentUser, allUsers, users, menuItems, orders, onLogout, onPlaceOrder, onUpdateUser, onUpdateMenu, onCreateAdmin, onToggleAdminStatus
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('sales');
  
  const businessName = currentUser.businessName || "Restaurant Admin";

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesDashboard orders={orders} users={users} menuItems={menuItems} />;
      case 'order':
        return <OrderEntry menuItems={menuItems} users={users} onPlaceOrder={onPlaceOrder} />;
      case 'menu':
        return <MenuManagement menuItems={menuItems} onUpdateMenu={onUpdateMenu} />;
      case 'settings':
        return <AdminSettings 
                    currentUser={currentUser}
                    allUsers={allUsers}
                    onUpdateUser={onUpdateUser}
                    onCreateAdmin={onCreateAdmin}
                    onToggleAdminStatus={onToggleAdminStatus}
                />;
      default:
        return null;
    }
  };
  
  const NavItem: React.FC<{tab: AdminTab, label: string, children: React.ReactNode}> = ({ tab, label, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-semibold ${
        activeTab === tab
          ? 'bg-amber-600 text-white shadow-md'
          : 'text-gray-300 hover:bg-gray-700/50'
      }`}
    >
        {children}
        <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen">
       {/* Header */}
      <header className="bg-gray-900/80 p-4 border-b border-gray-700 sticky top-0 z-30 backdrop-blur-sm">
        <div className="flex justify-between items-center">
            {/* Left side: Business Name & Nav */}
            <div className="flex items-center space-x-8">
                <div>
                    <h1 className="text-2xl font-bold text-amber-400 font-display">{businessName}</h1>
                    <p className="text-sm text-gray-400 -mt-1">Admin Panel</p>
                </div>
                <nav className="hidden md:flex items-center space-x-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                    <NavItem tab="sales" label={t('salesDashboard')}>
                        <ChartBarIcon className="w-5 h-5" />
                    </NavItem>
                    <NavItem tab="order" label={t('newOrder')}>
                        <ClipboardDocumentListIcon className="w-5 h-5" />
                    </NavItem>
                    <NavItem tab="menu" label={t('menu')}>
                        <BookOpenIcon className="w-5 h-5" />
                    </NavItem>
                    <NavItem tab="settings" label={t('settings')}>
                        <Cog6ToothIcon className="w-5 h-5" />
                    </NavItem>
                </nav>
            </div>

            {/* Right side: Logout */}
            <button 
              onClick={onLogout} 
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 rounded-md hover:bg-red-800/50 hover:text-white transition-colors border border-gray-700"
            >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{t('logout')}</span>
            </button>
        </div>
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center space-x-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700 mt-4">
            <NavItem tab="sales" label={t('salesDashboard')}>
                <ChartBarIcon className="w-5 h-5" />
            </NavItem>
            <NavItem tab="order" label={t('newOrder')}>
                <ClipboardDocumentListIcon className="w-5 h-5" />
            </NavItem>
            <NavItem tab="menu" label={t('menu')}>
                <BookOpenIcon className="w-5 h-5" />
            </NavItem>
            <NavItem tab="settings" label={t('settings')}>
                <Cog6ToothIcon className="w-5 h-5" />
            </NavItem>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;