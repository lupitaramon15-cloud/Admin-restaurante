import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { MenuItem, OrderItem, PaymentMethod } from '../../types';
import { PlusIcon, TrashIcon, PhotoIcon, SparklesIcon } from '../common/icons';

interface CustomerMenuProps {
  menuItems: MenuItem[];
  onPlaceOrder: (orderItems: OrderItem[], paymentMethod: PaymentMethod) => void;
}

const CustomerMenu: React.FC<CustomerMenuProps> = ({ menuItems, onPlaceOrder }) => {
  const { t } = useLanguage();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderPlacedMessage, setOrderPlacedMessage] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');

  const categoryTranslations: Record<MenuItem['category'], string> = {
    appetizer: t('categoryAppetizer'),
    main: t('categoryMain'),
    dessert: t('categoryDessert'),
    beverage: t('categoryBeverage'),
  };

  const specials = menuItems.filter(item => item.isSpecial);
  const regularItems = menuItems.filter(item => !item.isSpecial);

  const menuByCategory = regularItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  const categoryOrder: MenuItem['category'][] = ['appetizer', 'main', 'dessert', 'beverage'];

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
    onPlaceOrder(cart, selectedPayment);
    setCart([]);
    setOrderPlacedMessage(true);
    setTimeout(() => setOrderPlacedMessage(false), 3000);
  };
  
  const getMenuItemName = (id: string) => menuItems.find(item => item.id === id)?.name || '...';

  const MenuItemCard: React.FC<{item: MenuItem}> = ({ item }) => (
    <div className="relative bg-gray-900 rounded-lg flex flex-col justify-end shadow-lg border border-gray-700/50 overflow-hidden h-[75vh] md:h-auto md:justify-start md:bg-gray-800/50">
        {/* Image - covers the entire container */}
        <div className="absolute inset-0 w-full h-full">
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
            ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-500">
                    <PhotoIcon className="w-12 h-12" />
                </div>
            )}
        </div>
        
        {/* Desktop-only spacer for image aspect ratio */}
        <div className="hidden md:block relative w-full aspect-[4/3]"></div>

        {/* Content - Overlay on mobile, standard block on desktop */}
        <div className="relative z-10 p-5 flex flex-col justify-between flex-grow bg-gradient-to-t from-black/80 to-transparent md:bg-transparent">
            <div>
                <h3 className="text-2xl md:text-xl font-bold text-white md:text-amber-400">{item.name}</h3>
                <p className="text-gray-200 md:text-gray-400 mt-2 text-sm">{item.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
                <p className="text-xl md:text-lg font-bold text-white">${item.price.toFixed(2)}</p>
                <button onClick={() => addToCart(item)} className="flex items-center px-3 py-2 text-xs font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    {t('addToOrder')}
                </button>
            </div>
        </div>
    </div>
  );

  const PaymentOption: React.FC<{value: PaymentMethod, label: string}> = ({ value, label }) => (
    <label className={`block p-3 rounded-lg border cursor-pointer transition-all ${selectedPayment === value ? 'bg-amber-600/20 border-amber-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
        <input 
            type="radio" 
            name="paymentMethod" 
            value={value}
            checked={selectedPayment === value}
            onChange={() => setSelectedPayment(value)}
            className="sr-only"
        />
        <span className="font-semibold text-sm">{label}</span>
    </label>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8">
      {/* Menu */}
      <div className="lg:col-span-2 space-y-8">
        {/* Specials Section */}
        {specials.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4 flex items-center">
              <SparklesIcon className="w-7 h-7 mr-3 text-yellow-400"/>
              {t('todaysSpecials')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
              {specials.map((item) => <MenuItemCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {/* Regular Menu */}
        {categoryOrder.map(category => (
          menuByCategory[category] && (
            <div key={category}>
              <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4">{categoryTranslations[category]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                 {menuByCategory[category].map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Cart */}
      <div className="lg:col-span-1 bg-black/50 backdrop-blur-sm rounded-lg p-6 flex flex-col h-full max-h-[calc(100vh-120px)]">
        <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">{t('yourOrder')}</h2>
        {orderPlacedMessage && <div className="bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-lg p-3 text-center mb-4">{t('orderPlaced')}</div>}
        <div className="flex-1 overflow-y-auto space-y-3">
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
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">{t('selectPaymentMethod')}</h3>
                    <div className="space-y-2">
                        <PaymentOption value="cash" label={t('paymentCash')} />
                        <PaymentOption value="transfer" label={t('paymentTransfer')} />
                        <PaymentOption value="card" label={t('paymentCard')} />
                    </div>
                </div>
                <div className="flex justify-between items-center text-xl font-bold my-4">
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
  );
};

export default CustomerMenu;