import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { User, MenuItem, Order, OrderItem, PaymentMethod } from '../types';
import CustomerMenu from './customer/CustomerMenu';
import { ArrowLeftOnRectangleIcon } from './common/icons';

interface CustomerDashboardProps {
  currentUser: User;
  businessName: string;
  menuItems: MenuItem[];
  orders: Order[];
  onLogout: () => void;
  onPlaceOrder: (orderItems: OrderItem[], paymentMethod: PaymentMethod) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ currentUser, businessName, menuItems, onLogout, onPlaceOrder }) => {
    const { t } = useLanguage();

    return (
        <div>
            <header className="bg-black/30 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-700/50">
                <h1 className="text-2xl font-bold text-amber-400 font-display">
                    {businessName}
                </h1>
                <div className='text-right'>
                    <p className="text-lg text-white">{t('welcomeMessage')} {currentUser.username}!</p>
                    <button 
                        onClick={onLogout} 
                        className="inline-flex items-center space-x-2 px-3 py-1 mt-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </header>
            <main>
                <CustomerMenu menuItems={menuItems} onPlaceOrder={onPlaceOrder} />
            </main>
        </div>
    );
};

export default CustomerDashboard;