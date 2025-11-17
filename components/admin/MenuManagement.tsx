import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import Modal from '../common/Modal';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, SparklesIcon } from '../common/icons';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onUpdateMenu: (menu: MenuItem[]) => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, onUpdateMenu }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const categoryOrder: MenuItem['category'][] = ['appetizer', 'main', 'dessert', 'beverage'];
  const categoryTranslations: Record<MenuItem['category'], string> = {
    appetizer: t('categoryAppetizer'),
    main: t('categoryMain'),
    dessert: t('categoryDessert'),
    beverage: t('categoryBeverage'),
  };

  const menuByCategory = menuItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  const handleOpenModal = (item: MenuItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = (itemData: Omit<MenuItem, 'id' | 'restaurantId'> & { id?: string }) => {
    let updatedMenu;
    if (itemData.id) {
      // This is an update
      updatedMenu = menuItems.map(item => item.id === itemData.id ? { ...item, ...itemData } as MenuItem : item);
    } else {
      // This is a new item
      const currentRestaurantId = menuItems.length > 0 ? menuItems[0].restaurantId : ''; // A way to get current admin's restaurantID
      const newItem: MenuItem = {
        ...itemData,
        id: `menu-${Date.now()}`,
        price: Number(itemData.price),
        restaurantId: currentRestaurantId, 
      };
      updatedMenu = [...menuItems, newItem];
    }
    onUpdateMenu(updatedMenu);
    handleCloseModal();
  };
  
  const handleDeleteItem = (id: string) => {
      const updatedMenu = menuItems.filter(item => item.id !== id);
      onUpdateMenu(updatedMenu);
      setItemToDelete(null); 
  }
  
  const handleToggleSpecial = (itemId: string) => {
    const updatedMenu = menuItems.map(item =>
        item.id === itemId ? { ...item, isSpecial: !item.isSpecial } : item
    );
    onUpdateMenu(updatedMenu);
  };

  const ToggleSwitch: React.FC<{
    id: string;
    checked: boolean;
    onChange: () => void;
  }> = ({ id, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-amber-800/50' : 'bg-gray-600'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
            checked ? 'transform translate-x-6 bg-amber-500' : ''
          }`}
        ></div>
      </div>
    </label>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-amber-400 font-display">{t('menuManagement')}</h2>
        <button onClick={() => handleOpenModal(null)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>{t('addMenuItem')}</span>
        </button>
      </div>

      {categoryOrder.map(category => (
          menuByCategory[category] && (
            <div key={category}>
              <h3 className="text-2xl font-semibold text-amber-300 font-display mb-4">{categoryTranslations[category]}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {menuByCategory[category].map((item) => (
                    <div key={item.id} className={`bg-gray-800/50 rounded-lg shadow-lg border flex flex-col transition-all duration-300 ${item.isSpecial ? 'border-amber-500 shadow-amber-500/10' : 'border-gray-700/50'}`}>
                        {item.imageUrl ? (
                           <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover rounded-t-lg"/>
                        ) : (
                           <div className="w-full h-48 bg-gray-700 flex items-center justify-center rounded-t-lg text-gray-500">
                               <PhotoIcon className="w-12 h-12" />
                           </div>
                        )}
                        <div className="p-4 flex flex-col flex-grow">
                            <h4 className="text-xl font-bold text-amber-400">{item.name}</h4>
                            {item.isSpecial && <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded-full self-start my-1">{t('todaysSpecials')}</span>}
                            <p className="text-sm text-gray-400 mt-2 flex-grow">{item.description}</p>
                            <p className="text-lg font-bold text-white mt-4">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-gray-900/30 rounded-b-lg border-t border-gray-700/50 flex justify-end items-center space-x-3">
                            <label htmlFor={`special-${item.id}`} className="flex items-center space-x-2 mr-auto cursor-pointer" title={t('itemIsSpecial')}>
                                <SparklesIcon className={`w-5 h-5 transition-colors ${item.isSpecial ? 'text-yellow-400' : 'text-gray-500'}`} />
                            </label>
                            <ToggleSwitch
                                id={`special-${item.id}`}
                                checked={item.isSpecial || false}
                                onChange={() => handleToggleSpecial(item.id)}
                            />
                            <div className="w-px h-6 bg-gray-700"></div> {/* separator */}
                            <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-amber-400 transition-colors" aria-label={`Edit ${item.name}`}><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => setItemToDelete(item)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete ${item.name}`}><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )
        ))}

        {isModalOpen && <MenuItemFormModal item={editingItem} onClose={handleCloseModal} onSave={handleSaveItem} />}
        
        {itemToDelete && (
            <Modal isOpen={true} onClose={() => setItemToDelete(null)} title={t('confirmDeleteTitle')} size="md">
                <div className="space-y-4">
                    <p>{t('confirmDeleteMessage')}</p>
                    <p className="font-bold text-amber-400">{itemToDelete.name}</p>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">
                            {t('cancel')}
                        </button>
                        <button onClick={() => handleDeleteItem(itemToDelete.id)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            {t('delete')}
                        </button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

const MenuItemFormModal: React.FC<{item: MenuItem | null, onClose: () => void, onSave: (data: any) => void}> = ({ item, onClose, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        id: item?.id || undefined,
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || 0,
        category: item?.category || 'main',
        imageUrl: item?.imageUrl || '',
        isSpecial: item?.isSpecial || false,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, price: parseFloat(String(formData.price)) });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={item ? t('editMenuItem') : t('addMenuItem')} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">{t('itemName')}</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t('itemDescription')}</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300">{t('itemPrice')}</label>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300">{t('itemCategory')}</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none">
                            <option value="appetizer">{t('categoryAppetizer')}</option>
                            <option value="main">{t('categoryMain')}</option>
                            <option value="dessert">{t('categoryDessert')}</option>
                            <option value="beverage">{t('categoryBeverage')}</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">{t('itemImageUrl')}</label>
                    <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" name="isSpecial" id="isSpecial" checked={formData.isSpecial} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 bg-gray-700" />
                    <label htmlFor="isSpecial" className="ml-2 block text-sm text-gray-300">{t('itemIsSpecial')}</label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">{t('save')}</button>
                </div>
            </form>
        </Modal>
    );
};

export default MenuManagement;