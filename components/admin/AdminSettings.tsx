import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { User } from '../../types';

interface AdminSettingsProps {
  currentUser: User;
  allUsers: User[];
  onUpdateUser: (user: User) => void;
  onCreateAdmin: (businessName: string, username: string, password_not_safe: string) => string | null;
  onToggleAdminStatus: (adminId: string) => void;
}

const generateShareableUrl = (restaurantId: string): string => {
  const url = new URL(window.location.origin);
  url.hash = `restaurant=${restaurantId}`;
  return url.toString();
};


const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser, allUsers, onUpdateUser, onCreateAdmin, onToggleAdminStatus }) => {
  const { t } = useLanguage();
  const [accountForm, setAccountForm] = useState({
    username: currentUser.username,
    password: '',
    whatsApp: currentUser.whatsApp,
  });
  const [businessNameForm, setBusinessNameForm] = useState(currentUser.businessName || '');
  const [accountSaved, setAccountSaved] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // State for the admin generator
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [isGeneratedLinkCopied, setIsGeneratedLinkCopied] = useState(false);

  const shareableLink = generateShareableUrl(currentUser.restaurantId);
  
  const manageableAdmins = allUsers.filter(u => u.role === 'admin' && u.id !== currentUser.id);

  useEffect(() => {
    setAccountForm({
      username: currentUser.username,
      password: '',
      whatsApp: currentUser.whatsApp,
    });
    setBusinessNameForm(currentUser.businessName || '');
  }, [currentUser]);
  
  const handleCopyLink = (link: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    navigator.clipboard.writeText(link).then(() => {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
    });
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      ...accountForm,
      password: accountForm.password ? accountForm.password : currentUser.password,
    };
    onUpdateUser(updatedUser);
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 3000);
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, businessName: businessNameForm });
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 3000);
  };
  
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerationError('');
    setGeneratedLink('');

    if (!newBusinessName || !newAdminUsername || !newAdminPassword) {
        setGenerationError("Todos los campos son obligatorios.");
        return;
    }

    const newAdminId = onCreateAdmin(newBusinessName, newAdminUsername, newAdminPassword);
    
    if (newAdminId) {
        const url = generateShareableUrl(newAdminId);
        setGeneratedLink(url);
        setNewBusinessName('');
        setNewAdminUsername('');
        setNewAdminPassword('');
    } else {
        setGenerationError("El nombre de usuario ya existe. Por favor, elige otro.");
    }
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
        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${
            checked ? 'transform translate-x-6 bg-green-400' : ''
          }`}
        ></div>
      </div>
    </label>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Super Admin Section */}
      {currentUser.username === 'madisonabigail1103admin' && (
        <>
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-amber-600/50">
                <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">Generador de URL de Administrador</h2>
                <form onSubmit={handleGenerateLink} className="space-y-4">
                    <div>
                    <label htmlFor="newBusinessName" className="block text-sm font-medium text-gray-300">Nombre del Restaurante</label>
                    <input
                        type="text"
                        id="newBusinessName"
                        value={newBusinessName}
                        onChange={(e) => setNewBusinessName(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="Ej: La Trattoria de Luigi"
                    />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="newAdminUsername" className="block text-sm font-medium text-gray-300">Nuevo Usuario Administrador</label>
                        <input
                        type="text"
                        id="newAdminUsername"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="Ej: luigi_admin"
                        />
                    </div>
                    <div>
                        <label htmlFor="newAdminPassword" className="block text-sm font-medium text-gray-300">Contraseña Temporal</label>
                        <input
                        type="password"
                        id="newAdminPassword"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        placeholder="••••••••"
                        />
                    </div>
                    </div>
                    <div className="flex justify-end items-center">
                        {generationError && <span className="text-red-400 mr-4 animate-fadeIn">{generationError}</span>}
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
                        Generar Enlace
                        </button>
                    </div>
                </form>
                {generatedLink && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Enlace generado con éxito. Compártelo con tu cliente:</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={generatedLink} 
                                className="w-full p-2 bg-gray-900/80 border border-gray-600 rounded-lg focus:outline-none text-gray-300"
                            />
                            <button 
                                onClick={() => handleCopyLink(generatedLink, setIsGeneratedLinkCopied)} 
                                className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 whitespace-nowrap"
                            >
                                {isGeneratedLinkCopied ? '¡Copiado!' : 'Copiar Enlace'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
                <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">Gestionar Suscripciones</h2>
                <div className="space-y-3">
                    {manageableAdmins.length > 0 ? manageableAdmins.map(admin => (
                        <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-md border border-gray-700">
                            <div>
                                <p className="font-semibold">{admin.businessName}</p>
                                <p className="text-sm text-gray-400">{admin.username}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${admin.isActive ?? true ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                    {admin.isActive ?? true ? 'Activo' : 'Inactivo'}
                                </span>
                                <ToggleSwitch id={`toggle-${admin.id}`} checked={admin.isActive ?? true} onChange={() => onToggleAdminStatus(admin.id)} />
                            </div>
                        </div>
                    )) : <p className="text-gray-500 text-center">No has creado ningún administrador todavía.</p>}
                </div>
            </div>
        </>
      )}

      {/* Share Link Section */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-semibold text-amber-400 font-display mb-2">Comparte tu Menú</h2>
        <p className="text-sm text-gray-400 mb-4">Comparte este enlace con tus clientes para que vean tu menú y hagan pedidos online.</p>
        <div className="flex flex-col sm:flex-row sm:space-x-2">
            <input 
                type="text" 
                readOnly 
                value={shareableLink} 
                className="w-full p-2 bg-gray-900/80 border border-gray-600 rounded-lg focus:outline-none text-gray-300"
            />
            <button 
                onClick={() => handleCopyLink(shareableLink, setIsCopied)} 
                className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 whitespace-nowrap"
            >
                {isCopied ? '¡Copiado!' : 'Copiar Enlace'}
            </button>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">{t('businessSettings')}</h2>
        <form onSubmit={handleBusinessSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-300">{t('businessName')}</label>
            <input
              type="text"
              id="businessName"
              value={businessNameForm}
              onChange={(e) => setBusinessNameForm(e.target.value)}
              className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end items-center">
             {businessSaved && <span className="text-green-400 mr-4 animate-fadeIn">{t('settingsSaved')}</span>}
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
              {t('saveSettings')}
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h2 className="text-2xl font-semibold text-amber-400 font-display mb-4">{t('accountSettings')}</h2>
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">{t('username')}</label>
              <input
                type="text"
                id="username"
                name="username"
                value={accountForm.username}
                onChange={handleAccountChange}
                disabled={currentUser.username === 'madisonabigail1103admin'}
                className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="whatsApp" className="block text-sm font-medium text-gray-300">{t('whatsApp')}</label>
              <input
                type="text"
                id="whatsApp"
                name="whatsApp"
                value={accountForm.whatsApp}
                onChange={handleAccountChange}
                className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={accountForm.password}
              onChange={handleAccountChange}
              placeholder="••••••••"
              aria-describedby="password-help"
              className="w-full mt-1 p-2 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <p id="password-help" className="mt-1 text-xs text-gray-500">{t('passwordHelp')}</p>
          </div>
          <div className="flex justify-end items-center">
             {accountSaved && <span className="text-green-400 mr-4 animate-fadeIn">{t('settingsSaved')}</span>}
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
              {t('saveSettings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;