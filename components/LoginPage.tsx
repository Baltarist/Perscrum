
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProjectIcon from './icons/ProjectIcon';
import SparklesIcon from './icons/SparklesIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.');
    }
    setIsLoading(false);
  };
  
  // Simulate social login by logging in a predefined user
  const handleSocialLogin = async (userEmail: string) => {
      setIsLoading(true);
      setError('');
      await login(userEmail);
      setIsLoading(false);
  }

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
            <p className="text-gray-600 dark:text-gray-400">Kişisel hedeflerinize AI desteğiyle ulaşın.</p>
        </div>
        
        <div className="space-y-4">
            <button onClick={() => handleSocialLogin('alex@example.com')} className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold text-gray-800 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 mr-2"/>
                Google ile Devam Et (Alex)
            </button>
             <button onClick={() => handleSocialLogin('maria@example.com')} className="w-full inline-flex items-center justify-center py-2.5 px-4 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.1,12.33,12,16.78,6.9,12.33a4.43,4.43,0,0,1,3.49-5.75,4.28,4.28,0,0,1,4.2,0A4.43,4.43,0,0,1,17.1,12.33ZM12,1.18A9.74,9.74,0,0,0,4.87,4.3,9.88,9.88,0,0,0,3,6.5a10,10,0,0,0-1,4.45A10.33,10.33,0,0,0,12,22.82,10.33,10.33,0,0,0,22,10.95a10,10,0,0,0-1,4.45,9.88,9.88,0,0,0-1.87-2.2A9.74,9.74,0,0,0,12,1.18Z"/></svg>
                Apple ile Devam Et (Maria)
            </button>
        </div>

        <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-full bg-gray-200 dark:bg-gray-600"></span>
            <span className="text-sm text-gray-400 dark:text-gray-500">veya</span>
            <span className="h-px w-full bg-gray-200 dark:bg-gray-600"></span>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresi</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full mt-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre (herhangi bir şey girin)"
              className="w-full mt-1 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300">
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;