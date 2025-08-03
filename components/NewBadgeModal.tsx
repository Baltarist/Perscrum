import React from 'react';
import { Badge } from '../types';
import XIcon from './icons/XIcon';

interface NewBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: Badge | null;
}

const NewBadgeModal: React.FC<NewBadgeModalProps> = ({ isOpen, onClose, badge }) => {
  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center p-8 text-center transform scale-95 transition-transform duration-300" style={{ animation: 'scaleUp 0.3s ease-out forwards' }}>
        
        <style>
            {`
            @keyframes scaleUp {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .confetti {
                position: absolute;
                width: 8px;
                height: 16px;
                background: #f00;
                top: -20px;
                animation: fall 3s linear infinite;
            }
            @keyframes fall {
                to { transform: translateY(100vh) rotate(360deg); }
            }
            `}
        </style>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-primary-500">YENİ ROZET KAZANILDI!</h2>
        
        <div className="my-6 animate-pulse" style={{ animationDuration: '2s' }}>
            <span className="text-8xl">{badge.icon}</span>
        </div>

        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{badge.name}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{badge.criteria}</p>

        <button 
            onClick={onClose}
            className="mt-8 w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
        >
            Harika!
        </button>
      </div>
    </div>
  );
};

export default NewBadgeModal;