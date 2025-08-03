import React, { useState } from 'react';
import DailyCheckinModal from './DailyCheckinModal';
import { useAuth } from '../hooks/useAuth';
import SparklesIcon from './icons/SparklesIcon';
import LogOutIcon from './icons/LogOutIcon';
import BellIcon from './icons/BellIcon';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const unreadNotificationsCount = currentUser.notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div>
           {/* Can be used for breadcrumbs or page titles in the future */}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Günlük AI Check-in</span>
          </button>
          
          <div className="relative">
            <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <BellIcon className="w-6 h-6"/>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold" style={{fontSize: '0.6rem'}}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && <NotificationDropdown onClose={() => setIsNotificationsOpen(false)} />}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <img
                className="w-10 h-10 rounded-full object-cover"
                src={`https://picsum.photos/seed/${currentUser.id}/100/100`}
                alt="User Avatar"
                />
                <div>
                <div className="font-semibold text-gray-800 dark:text-white">{currentUser.displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</div>
                </div>
            </div>
            <button onClick={logout} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="Çıkış Yap">
                <LogOutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <DailyCheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userName={currentUser.displayName}
      />
    </>
  );
};

export default Header;