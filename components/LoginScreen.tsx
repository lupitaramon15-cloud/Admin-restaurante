import React, { useState } from 'react';
import { UserIcon, LockClosedIcon } from './common/icons';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from './common/LanguageSwitcher';

interface LoginScreenProps {
  businessName: string;
  onLogin: (username: string, password_not_safe: string) => boolean;
  onRegister: (username: string, password_not_safe: string, whatsApp: string, role: 'customer' | 'admin') => boolean;
  isSuspended: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ businessName, onLogin, onRegister, isSuspended }) => {
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isSpecialAdmin = username.toLowerCase() === 'madisonabigail1103admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let success = false;
    if (isRegister) {
      // For this demo, the first registered user is an admin, others are customers.
      // In a real app, admin registration would be a separate, protected process.
      const role = username.toLowerCase() === 'admin' ? 'admin' : 'customer';
      success = onRegister(username, password, whatsApp, role);
      if (!success) {
          setError(t('registrationFailed'));
      }
    } else {
      success = onLogin(username, password);
       if (!success) {
          setError(t('loginFailed'));
      }
    }
  };
  
  if (isSuspended) {
    return (
        <div className="flex items-center justify-center min-h-screen">
             <div className="w-full max-w-md p-8 space-y-6 bg-black/60 backdrop-blur-lg border border-red-500/50 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-red-400 font-display">Cuenta Suspendida</h2>
                <p className="mt-2 text-gray-300">Esta cuenta de restaurante está temporalmente desactivada. Por favor, contacta con el soporte.</p>
             </div>
        </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md p-4 sm:p-8 space-y-6 bg-black/60 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-amber-400 font-display">
            {businessName || (isRegister ? t('signUp') : t('loginTitle'))}
          </h2>
          <p className="mt-2 text-center text-gray-400">
            {t('loginSubtitle')}
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">{t('username')}</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400"
              placeholder={t('username')}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">{t('password')}</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required={isRegister ? true : !isSpecialAdmin}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400"
              placeholder={t('password')}
            />
          </div>
          {isRegister && (
            <div>
              <label htmlFor="whatsApp" className="sr-only">{t('whatsApp')}</label>
              <input
                id="whatsApp"
                name="whatsApp"
                type="tel"
                autoComplete="tel"
                required
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                className="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-gray-400"
                placeholder={t('whatsApp')}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-medium text-white bg-amber-600 border border-transparent rounded-md group hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 focus:ring-offset-gray-800 transition-colors"
            >
              {isRegister ? t('signUp') : t('login')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
            <button onClick={() => { setIsRegister(!isRegister); setError(null); }} className="font-medium text-amber-400 hover:text-amber-300">
              {isRegister ? t('alreadyHaveAccount') : t('dontHaveAccount')} {isRegister ? t('login') : t('signUp')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;