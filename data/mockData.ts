import { MenuItem, User, Order } from '../types';

// In a real application, passwords would be securely hashed and stored.
// This is for demonstration purposes only.
export const initialUsers: User[] = [
  // Restaurant 1: Madison's Italian Kitchen
  { id: 'user-madison-admin', username: 'madisonabigail1103admin', password: '', whatsApp: 'N/A', role: 'admin', restaurantId: 'user-madison-admin', businessName: "Madison's Italian Kitchen", isActive: true },
  { id: 'user-1', username: 'admin', password: 'password123', whatsApp: '111-222-3333', role: 'admin', restaurantId: 'user-madison-admin', businessName: "Madison's Italian Kitchen", isActive: true },
  { id: 'user-2', username: 'john', password: 'password123', whatsApp: '444-555-6666', role: 'customer', restaurantId: 'user-madison-admin', location: { city: 'Madrid', country: 'ES'} },
  
  // Restaurant 2: Dave's Burger Shack
  { id: 'user-dave-admin', username: 'dave', password: 'password123', whatsApp: '777-888-9999', role: 'admin', restaurantId: 'user-dave-admin', businessName: "Dave's Burger Shack", isActive: true },
  { id: 'user-3', username: 'jane', password: 'password123', whatsApp: '123-456-7890', role: 'customer', restaurantId: 'user-dave-admin', location: { city: 'Barcelona', country: 'ES'} },

];

export const initialMenu: MenuItem[] = [
    // Restaurant 1 Menu
    { id: '1', name: 'Bruschetta al Pomodoro', description: 'Pan tostado con tomates frescos, ajo, albahaca y aceite de oliva.', price: 8.50, category: 'appetizer', imageUrl: 'https://images.pexels.com/photos/5639433/pexels-photo-5639433.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },
    { id: '2', name: 'Lasaña a la Boloñesa', description: 'Capas de pasta con rica salsa de carne, bechamel y queso parmesano.', price: 15.00, category: 'main', imageUrl: 'https://images.pexels.com/photos/6070381/pexels-photo-6070381.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: true, restaurantId: 'user-madison-admin' },
    { id: '3', name: 'Tiramisú Clásico', description: 'Capas de bizcocho empapado en café con crema de mascarpone y cacao.', price: 7.00, category: 'dessert', imageUrl: 'https://images.pexels.com/photos/159887/pexels-photo-159887.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },
    { id: '4', name: 'Limonada Fresca', description: 'Zumo de limón recién exprimido, agua y un toque de azúcar.', price: 4.00, category: 'beverage', imageUrl: 'https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },
    { id: '5', name: 'Ensalada Caprese', description: 'Tomate fresco, mozzarella de búfala, albahaca fresca, sal y aceite de oliva.', price: 10.00, category: 'appetizer', imageUrl: 'https://images.pexels.com/photos/1359325/pexels-photo-1359325.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },
    { id: '6', name: 'Pizza Margherita', description: 'Base de pizza con salsa de tomate, mozzarella fresca, albahaca, sal y aceite.', price: 12.50, category: 'main', imageUrl: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: true, restaurantId: 'user-madison-admin' },
    { id: '7', name: 'Panna Cotta', description: 'Postre de nata cocida, adornado con frutos rojos.', price: 6.50, category: 'dessert', imageUrl: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },
    { id: '8', name: 'Vino Tinto (Copa)', description: 'Selección de vino tinto de la casa.', price: 5.50, category: 'beverage', imageUrl: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: false, restaurantId: 'user-madison-admin' },

    // Restaurant 2 Menu
    { id: '9', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion, and our special sauce.', price: 11.00, category: 'main', restaurantId: 'user-dave-admin', imageUrl: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: '10', name: 'Loaded Fries', description: 'Crispy fries topped with cheese, bacon, and chives.', price: 7.50, category: 'appetizer', restaurantId: 'user-dave-admin', imageUrl: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=800', isSpecial: true },
    { id: '11', name: 'Chocolate Milkshake', description: 'Thick and creamy chocolate milkshake.', price: 6.00, category: 'beverage', restaurantId: 'user-dave-admin', imageUrl: 'https://images.pexels.com/photos/3727196/pexels-photo-3727196.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

// Mock order data for previous days
const generatePastDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
}

export const initialOrders: Order[] = [
  // Restaurant 1 Orders
  { id: 'order-1', userId: 'user-2', items: [{ menuItemId: '2', quantity: 1, price: 15.00 }, { menuItemId: '4', quantity: 1, price: 4.00 }], total: 19.00, date: generatePastDate(1), paymentMethod: 'card', restaurantId: 'user-madison-admin' },
  { id: 'order-2', userId: 'user-2', items: [{ menuItemId: '6', quantity: 2, price: 12.50 }], total: 25.00, date: generatePastDate(2), paymentMethod: 'cash', restaurantId: 'user-madison-admin' },
  { id: 'order-3', userId: 'user-2', items: [{ menuItemId: '1', quantity: 1, price: 8.50 }, { menuItemId: '3', quantity: 1, price: 7.00 }], total: 15.50, date: generatePastDate(3), paymentMethod: 'transfer', restaurantId: 'user-madison-admin' },
  { id: 'order-4', userId: 'user-2', items: [{ menuItemId: '5', quantity: 1, price: 10.00 }], total: 10.00, date: generatePastDate(5), paymentMethod: 'card', restaurantId: 'user-madison-admin' },
  { id: 'order-5', userId: 'user-2', items: [{ menuItemId: '2', quantity: 2, price: 15.00 }, {menuItemId: '8', quantity: 2, price: 5.50}], total: 41.00, date: generatePastDate(6), paymentMethod: 'cash', restaurantId: 'user-madison-admin' },
  
  // Restaurant 2 Orders
  { id: 'order-6', userId: 'user-3', items: [{ menuItemId: '9', quantity: 2, price: 11.00 }, { menuItemId: '11', quantity: 2, price: 6.00 }], total: 34.00, date: generatePastDate(1), paymentMethod: 'cash', restaurantId: 'user-dave-admin' },
  { id: 'order-7', userId: 'user-3', items: [{ menuItemId: '10', quantity: 1, price: 7.50 }], total: 7.50, date: generatePastDate(4), paymentMethod: 'card', restaurantId: 'user-dave-admin' },
];