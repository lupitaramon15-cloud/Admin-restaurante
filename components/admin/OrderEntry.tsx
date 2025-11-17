import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { MenuItem, OrderItem, User } from '../../types';
import { PlusIcon, TrashIcon } from '../common/icons';

interface OrderEntryProps {
  menuItems: MenuItem[];
  users: User[];
  onPlaceOrder: (orderItems: OrderItem[], customerId: string) => void;
}

const OrderEntry: React.FC<OrderEntryProps> = ({ menuItems, users, onPlaceOrder }) => {
  const { t } = useLanguage();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [orderPlacedMessage, setOrderPlacedMessage] = useState(false);

  const customers = users.filter(u => u.role === 'customer');

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.menuItemId === item.id);
      if (existingItem) {
        return prevCart.map(ci =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      } else {
        return [...prevCart, { menuItemId: item.id, quantity: 1, price: item.price }];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(ci => ci.menuItemId === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(ci =>
          ci.menuItemId === menuItemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      } else {
        return prevCart.filter(ci => ci.menuItemId !== menuItemId);
      }
    });
  };
  
  const handleNoteChange = (menuItemId: string, notes: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.menuItemId === menuItemId ? { ...item, notes } : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    onPlaceOrder(cart, selectedCustomerId);
    setCart([]);
    setSelectedCustomerId('walk-in');
    setOrderPlacedMessage(true);
    setTimeout(() => setOrderPlacedMessage(false), 3000);
  };

  const getMenuItemName = (id: string) => menuItems.find(item => item.id === id)?.name || '...';

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Menu List - Main scrolling area */}
      <div className="lg:flex-1 space-y-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between shadow-lg border border-gray-700/50 gap-4">
            <div>
              <h3 className="text-lg font-bold text-amber-400">{item.name}</h3>
              <p className="text-sm text-gray-400 max-w-md">{item.description}</p>
              <p className="text-md font-bold text-white mt-1">${item.price.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => addToCart(item)} 
              className="flex items-center px-3 py-2 text-xs font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 whitespace-nowrap flex-shrink-0"
              aria-label={`${t('addToOrder')} ${item.name}`}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {t('addToOrder')}
            </button>
          </div>
        ))}
      </div>

      {/* Cart & Customer Selection Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="sticky top-28">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 flex flex-col">
                <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">{t('yourOrder')}</h2>
                
                <div className="mb-4">
                    <label htmlFor="customer-select" className="block text-sm font-medium text-gray-300 mb-1">{t('selectCustomer')}</label>
                    <select 
                        id="customer-select" 
                        value={selectedCustomerId} 
                        onChange={e => setSelectedCustomerId(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="walk-in">{t('walkInCustomer')}</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>{customer.username}</option>
                        ))}
                    </select>
                </div>

                {orderPlacedMessage && <div className="bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-lg p-3 text-center mb-4 animate-fadeIn">{t('orderPlaced')}</div>}
                
                <div className="overflow-y-auto space-y-3 -mr-3 pr-3" style={{maxHeight: 'calc(100vh - 450px)'}}>
                    {cart.length > 0 ? cart.map(item => (
                        <div key={item.menuItemId} className="bg-gray-700/50 p-3 rounded-md animate-fadeIn">
                           <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{getMenuItemName(item.menuItemId)}</p>
                                    <p className="text-sm text-gray-400">x {item.quantity}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(item.menuItemId)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleNoteChange(item.menuItemId, e.target.value)}
                                placeholder={t('itemNotesPlaceholder')}
                                className="w-full mt-2 p-1.5 bg-gray-800/60 border border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder-gray-500"
                            />
                        </div>
                    )) : <p className="text-gray-500 text-center pt-10">{t('emptyCart')}</p>}
                </div>

                {cart.length > 0 && (
                    <div className="border-t border-gray-700 mt-4 pt-4">
                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                            <span>{t('total')}:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button onClick={handlePlaceOrder} className="w-full px-6 py-3 font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors">
                            {t('placeOrder')}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderEntry;