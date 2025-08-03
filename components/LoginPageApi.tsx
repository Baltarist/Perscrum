import React, { useState, useEffect } from 'react';
import { useAuthApi } from '../hooks/useAuthApi';
import ProjectIcon from './icons/ProjectIcon';
import SparklesIcon from './icons/SparklesIcon';

const LoginPageApi: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register, isLoading, error, clearError } = useAuthApi();

  // Clear error when switching modes or changing inputs
  useEffect(() => {
    clearError();
  }, [isRegisterMode, email, password, displayName, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isRegisterMode) {
      if (!displayName.trim()) {
        return;
      }
      await register(email, password, displayName);
    } else {
      await login(email, password);
    }
  };

  // Quick login with test users
  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    clearError();
    await login(userEmail, userPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-primary-500 rounded-2xl mr-4">
              <ProjectIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Scrum Koçu</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Kişisel hedeflerinize AI desteğiyle ulaşın.
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">Hızlı Giriş (Test Kullanıcıları):</p>
          <button
            onClick={() => handleQuickLogin('alex@example.com', 'password123')}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            Alex (Pro User)
          </button>
          <button
            onClick={() => handleQuickLogin('maria@example.com', 'password123')}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.1,12.33,12,16.78,6.9,12.33a4.43,4.43,0,0,1,3.49-5.75,4.28,4.28,0,0,1,4.2,0A4.43,4.43,0,0,1,17.1,12.33ZM12,1.18A9.74,9.74,0,0,0,4.87,4.3,9.88,9.88,0,0,0,3,6.5a10,10,0,0,0-1,4.45A10.33,10.33,0,0,0,12,22.82,10.33,10.33,0,0,0,22,10.95a10,10,0,0,0-1,4.45,9.88,9.88,0,0,0-1.87-2.2A9.74,9.74,0,0,0,12,1.18Z"/>
            </svg>
            Maria (Free User)
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-gray-200 dark:bg-gray-600"></span>
          <span className="text-sm text-gray-400 dark:text-gray-500">veya</span>
          <span className="h-px w-full bg-gray-200 dark:bg-gray-600"></span>
        </div>

        {/* Login/Register Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div>
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ad Soyad
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Adınız ve soyadınız"
                className="w-full mt-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required={isRegisterMode}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRegisterMode ? "ornek@email.com" : "alex@example.com"}
              className="w-full mt-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegisterMode ? "En az 8 karakter" : "password123"}
              className="w-full mt-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
              minLength={isRegisterMode ? 8 : undefined}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isRegisterMode ? 'Kayıt Oluşturuluyor...' : 'Giriş Yapılıyor...') 
                : (isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap')
              }
            </button>
          </div>
        </form>

        {/* Toggle Register/Login Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setDisplayName('');
              clearError();
            }}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {isRegisterMode 
              ? 'Zaten hesabınız var mı? Giriş yapın' 
              : 'Hesabınız yok mu? Kayıt olun'
            }
          </button>
        </div>

        {/* Backend Connection Status */}
        <div className="text-center text-xs text-gray-400">
          <SparklesIcon className="w-4 h-4 inline mr-1" />
          Backend API Bağlantısı Aktif
        </div>
      </div>
    </div>
  );
};

export default LoginPageApi;