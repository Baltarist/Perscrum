
import React from 'react';
import { Badge as BadgeType } from '../types';

interface BadgeProps {
    badge: BadgeType;
}

const Badge: React.FC<BadgeProps> = ({ badge }) => {
    return (
        <div 
            className="flex flex-col items-center justify-center text-center p-4 w-36 h-36 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm transition-transform duration-200 hover:scale-105"
            title={`${badge.name}: ${badge.criteria}`}
        >
            <span className="text-5xl">{badge.icon}</span>
            <span className="text-sm font-semibold mt-2 text-gray-700 dark:text-gray-200">{badge.name}</span>
        </div>
    );
};

export default Badge;
