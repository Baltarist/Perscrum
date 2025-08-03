import React, { useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProjectData } from '../hooks/useProjectData';
import { formatDate } from '../utils/date';
import { getColorClass } from '../utils/colors';

interface NotificationDropdownProps {
    onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
    const { currentUser, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
    const { getProjectById } = useProjectData();
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!currentUser) return null;
    const { notifications } = currentUser;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div ref={dropdownRef} className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Bildirimler</h3>
                {unreadCount > 0 && 
                    <button onClick={markAllNotificationsAsRead} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        Tümünü Okundu İşaretle
                    </button>
                }
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Hiç bildiriminiz yok.</p>
                ) : (
                    notifications.map(notification => {
                        const project = getProjectById(notification.projectId);
                        return (
                            <div 
                                key={notification.id} 
                                className={`p-3 border-l-4 ${!notification.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''} ${project ? getColorClass(project.colorTheme, 'border') : 'border-gray-500'}`}
                                onClick={() => markNotificationAsRead(notification.id)}
                            >
                                <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(notification.timestamp)}</p>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}

export default NotificationDropdown;