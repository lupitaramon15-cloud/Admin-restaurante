import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { MenuItem, Order, User, PaymentMethod } from '../../types';
import { ArrowPathIcon, TrophyIcon, CurrencyDollarIcon } from '../common/icons';

interface SalesDashboardProps {
  orders: Order[];
  users: User[];
  menuItems: MenuItem[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ orders, users, menuItems }) => {
  const { t } = useLanguage();

  const userMap = new Map<string, User>(users.map(u => [u.id, u]));
  const menuMap = new Map(menuItems.map(m => [m.id, m.name]));

  // --- Today's Sales Calculation ---
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.date.startsWith(today)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const walkInTodaysOrders = todaysOrders.filter(o => o.userId === 'walk-in');
  const registeredTodaysOrders = todaysOrders.filter(o => o.userId !== 'walk-in');
  
  const totalWalkInSales = walkInTodaysOrders.reduce((sum, order) => sum + order.total, 0);
  const totalRegisteredSales = registeredTodaysOrders.reduce((sum, order) => sum + order.total, 0);
  const totalDaySales = totalWalkInSales + totalRegisteredSales;

  // --- Weekly Sales Chart Data ---
  const salesLast7Days: { [key: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().split('T')[0];
    salesLast7Days[dayKey] = 0;
  }
  orders.forEach(order => {
    const dayKey = order.date.split('T')[0];
    if (dayKey in salesLast7Days) {
      salesLast7Days[dayKey] += order.total;
    }
  });
  
  const weeklySalesData = Object.entries(salesLast7Days).map(([date, total]) => ({
      date,
      total,
      label: new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })
  }));

  const maxWeeklySale = Math.max(...weeklySalesData.map(d => d.total), 1); // Avoid division by zero

  // --- Frequent Customers ---
  const customerStats = users
    .filter((u) => u.role === 'customer')
    // FIX: Provide a specific type for the accumulator to resolve downstream type errors on customer stats.
    .reduce((acc: Record<string, User & { totalSpent: number; orderCount: number }>, user) => {
        acc[user.id] = { ...user, totalSpent: 0, orderCount: 0 };
        return acc;
    }, {});


  orders.forEach(order => {
      if (customerStats[order.userId]) {
          customerStats[order.userId].totalSpent += order.total;
          customerStats[order.userId].orderCount += 1;
      }
  });

  const allCustomers = Object.values(customerStats);
  const topSpenders = [...allCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);
  const mostFrequent = [...allCustomers].sort((a, b) => b.orderCount - a.orderCount).slice(0, 3);
  
  const renderOrderList = (orderList: Order[]) => (
     <ul className="space-y-4">
        {orderList.map(order => (
            <li key={order.id} className="p-3 bg-gray-700/50 rounded-md">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-300">{userMap.get(order.userId)?.username || t('walkInCustomer')}</span>
                    <span className="text-lg font-bold text-amber-400">${order.total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString()}</p>
                <ul className="text-sm text-gray-400 mt-2 pl-4 list-disc list-inside space-y-1">
                    {order.items.map(item => (
                        <li key={item.menuItemId}>
                           <span>{item.quantity} x {menuMap.get(item.menuItemId) || 'Unknown Item'}</span>
                           {item.notes && (
                                <p className="text-xs text-amber-300/90 pl-4 italic">"{item.notes}"</p>
                           )}
                        </li>
                    ))}
                </ul>
            </li>
        ))}
    </ul>
  );

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch(method) {
        case 'cash': return t('paymentCash');
        case 'card': return t('paymentCard');
        case 'transfer': return t('paymentTransfer');
        default: return method;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4">{t('totalSalesToday')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50 flex items-center space-x-4">
                <CurrencyDollarIcon className="w-10 h-10 text-green-400 flex-shrink-0" />
                <div>
                    <p className="text-gray-400 text-sm">{t('totalSales')}</p>
                    <p className="text-2xl font-bold text-white">${totalDaySales.toFixed(2)}</p>
                </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50 flex items-center space-x-4">
                 <CurrencyDollarIcon className="w-10 h-10 text-amber-400 flex-shrink-0" />
                 <div>
                    <p className="text-gray-400 text-sm">{t('registeredCustomerSales')}</p>
                    <p className="text-2xl font-bold text-white">${totalRegisteredSales.toFixed(2)}</p>
                </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50 flex items-center space-x-4">
                 <CurrencyDollarIcon className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                 <div>
                    <p className="text-gray-400 text-sm">{t('walkInSales')}</p>
                    <p className="text-2xl font-bold text-white">${totalWalkInSales.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-semibold text-amber-300 font-display mb-4">{t('registeredCustomerOrders')}</h3>
          <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50 max-h-96 overflow-y-auto">
              {registeredTodaysOrders.length > 0 ? renderOrderList(registeredTodaysOrders) : <p className="text-gray-400">{t('noSalesToday')}</p>}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-amber-300 font-display mb-4">{t('walkInOrders')}</h3>
          <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50 max-h-96 overflow-y-auto">
              {walkInTodaysOrders.length > 0 ? renderOrderList(walkInTodaysOrders) : <p className="text-gray-400">{t('noSalesToday')}</p>}
          </div>
        </div>
      </div>
      
       <div>
        <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4">{t('frequentCustomers')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{t('topSpenders')}</h3>
                <ul className="space-y-3">
                    {topSpenders.map((user, index) => (
                        <li key={user.id} className="flex items-center space-x-4">
                            <TrophyIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-200">{user.username}</p>
                                <p className="text-sm text-gray-400">${user.totalSpent.toFixed(2)} {t('totalSpent')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{t('mostFrequent')}</h3>
                 <ul className="space-y-3">
                    {mostFrequent.map((user, index) => (
                        <li key={user.id} className="flex items-center space-x-4">
                            <ArrowPathIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-200">{user.username}</p>
                                <p className="text-sm text-gray-400">{user.orderCount} {t('totalOrders')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4">{t('weeklySales')}</h2>
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-700/50 overflow-x-auto">
            <div className="flex justify-between items-end h-64 space-x-2 min-w-[400px]">
                {weeklySalesData.map(day => (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end">
                        <div className="text-sm font-bold text-gray-100">${day.total.toFixed(0)}</div>
                        <div className="w-full bg-gray-700 rounded-t-md hover:bg-amber-500 transition-colors group" style={{ height: `${(day.total / maxWeeklySale) * 100}%` }}>
                           <div className="w-full h-full bg-amber-600 rounded-t-md opacity-80 group-hover:opacity-100"></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{day.label}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
       <div>
        <h2 className="text-3xl font-semibold text-amber-400 font-display mb-4">{t('orderHistory')}</h2>
        <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700/50 max-h-96 overflow-y-auto">
            <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-900/80 backdrop-blur-sm">
                    <tr>
                        <th className="p-4">{t('order')} ID</th>
                        <th className="p-4">{t('customerName')}</th>
                        <th className="p-4">{t('whatsApp')}</th>
                        <th className="p-4">{t('location')}</th>
                        <th className="p-4">{t('paymentMethod')}</th>
                        <th className="p-4">{t('date')}</th>
                        <th className="p-4 text-right">{t('total')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {orders.length > 0 ? orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => {
                        const user = userMap.get(order.userId);
                        return (
                        <tr key={order.id} className="hover:bg-gray-700/50">
                            <td className="p-4 text-sm text-gray-400 font-mono">{order.id.slice(-6)}</td>
                            <td className="p-4">{user?.username || t('walkInCustomer')}</td>
                            <td className="p-4 text-sm text-gray-400">{user?.whatsApp || 'N/A'}</td>
                            <td className="p-4 text-sm text-gray-400">{user?.location ? `${user.location.city}, ${user.location.country}` : 'N/A'}</td>
                            <td className="p-4 text-sm text-gray-300">{getPaymentMethodLabel(order.paymentMethod)}</td>
                            <td className="p-4">{new Date(order.date).toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-amber-400">${order.total.toFixed(2)}</td>
                        </tr>
                    )}) : (
                        <tr><td colSpan={7} className="p-4 text-center text-gray-400">{t('noOrders')}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default SalesDashboard;