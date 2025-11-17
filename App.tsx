import React, { useState, useMemo } from 'react';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import { User, Order, MenuItem, OrderItem, PaymentMethod } from './types';
import { initialUsers, initialMenu, initialOrders } from './data/mockData';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';

const AppContent: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenu);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { t } = useLanguage();

  const { restaurantIdFromUrl, defaultRestaurantId } = useMemo(() => {
    const hash = window.location.hash;
    const match = hash.match(/#restaurant=([^&]+)/);
    const idFromHash = match ? match[1] : null;

    return {
      restaurantIdFromUrl: idFromHash,
      defaultRestaurantId: initialUsers.find(u => u.role === 'admin')?.id || null
    };
  }, []);

  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(restaurantIdFromUrl || defaultRestaurantId);

  const restaurantAdmin = useMemo(() => 
    users.find(u => u.id === activeRestaurantId && u.role === 'admin')
  , [users, activeRestaurantId]);

  const isRestaurantActive = restaurantAdmin ? (restaurantAdmin.isActive ?? true) : false;
  const businessName = (isRestaurantActive && restaurantAdmin?.businessName) ? restaurantAdmin.businessName : "Welcome";

  const restaurantUsers = useMemo(() => users.filter(u => u.restaurantId === activeRestaurantId), [users, activeRestaurantId]);
  const restaurantMenuItems = useMemo(() => menuItems.filter(m => m.restaurantId === activeRestaurantId), [menuItems, activeRestaurantId]);
  const restaurantOrders = useMemo(() => orders.filter(o => o.restaurantId === activeRestaurantId), [orders, activeRestaurantId]);
  
  const handleLogin = (username: string, password_not_safe: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.password === password_not_safe) {
      const restaurantForUser = users.find(r => r.id === user.restaurantId && r.role === 'admin');
      const isUserRestaurantActive = restaurantForUser ? (restaurantForUser.isActive ?? true) : false;
      
      if (!isUserRestaurantActive && user.role !== 'admin') {
         // Prevent customer login if their associated restaurant is suspended.
         return false;
      }
      
      setCurrentUser(user);
      setActiveRestaurantId(user.restaurantId);
      return true;
    }
    
    // Superadmin special case
    if (user && user.username === 'madisonabigail1103admin' && user.role === 'admin') {
      setCurrentUser(user);
      setActiveRestaurantId(user.id);
      return true;
    }
    
    return false;
  };

  const handleRegister = (username: string, password_not_safe: string, whatsApp: string, role: 'customer' | 'admin'): boolean => {
    if (!activeRestaurantId || !isRestaurantActive) return false;
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password: password_not_safe,
      whatsApp,
      role,
      restaurantId: activeRestaurantId,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRestaurantId(restaurantIdFromUrl || defaultRestaurantId);
  };
  
  const handlePlaceOrder = (orderItems: OrderItem[], paymentMethod: PaymentMethod, customerId?: string) => {
    if (!activeRestaurantId) return;
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: customerId || currentUser!.id,
      items: orderItems,
      total,
      date: new Date().toISOString(),
      paymentMethod,
      restaurantId: activeRestaurantId,
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  }

  const handleUpdateMenu = (updatedMenu: MenuItem[]) => {
      const otherRestaurantsMenu = menuItems.filter(item => item.restaurantId !== activeRestaurantId);
      setMenuItems([...otherRestaurantsMenu, ...updatedMenu]);
  }

  const handleCreateAdmin = (businessName: string, username: string, password_not_safe: string): string | null => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return null;
    }
    const newAdminId = `user-admin-${Date.now()}`;
    const newAdmin: User = {
      id: newAdminId,
      username,
      password: password_not_safe,
      whatsApp: 'N/A',
      role: 'admin',
      restaurantId: newAdminId,
      businessName,
      isActive: true,
    };
    setUsers(prev => [...prev, newAdmin]);
    return newAdminId;
  };

  const handleToggleAdminStatus = (adminId: string) => {
    setUsers(prevUsers => 
        prevUsers.map(user => 
            user.id === adminId && user.role === 'admin' 
                ? { ...user, isActive: !(user.isActive ?? true) } 
                : user
        )
    );
  };

  const renderContent = () => {
    if (currentUser) {
        if (currentUser.role === 'admin') {
            return (
                <AdminDashboard 
                  currentUser={currentUser}
                  allUsers={users}
                  users={restaurantUsers}
                  menuItems={restaurantMenuItems}
                  orders={restaurantOrders}
                  onLogout={handleLogout}
                  onPlaceOrder={(items, customerId) => handlePlaceOrder(items, 'cash', customerId)}
                  onUpdateUser={handleUpdateUser}
                  onUpdateMenu={handleUpdateMenu}
                  onCreateAdmin={handleCreateAdmin}
                  onToggleAdminStatus={handleToggleAdminStatus}
                />
            );
        } else { // Customer
            return (
                <CustomerDashboard 
                  currentUser={currentUser}
                  businessName={businessName}
                  menuItems={restaurantMenuItems}
                  orders={restaurantOrders.filter(o => o.userId === currentUser.id)}
                  onLogout={handleLogout}
                  onPlaceOrder={(items, payment) => handlePlaceOrder(items, payment)}
                />
            );
        }
    }
    
    // Default to Login screen if no user is logged in
    return (
        <LoginScreen 
          businessName={businessName}
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          isSuspended={!isRestaurantActive && !!activeRestaurantId}
        />
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}>
      <div className="bg-black/60 min-h-screen">
          {renderContent()}
      </div>
    </div>
  );
};

const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);

export default App;