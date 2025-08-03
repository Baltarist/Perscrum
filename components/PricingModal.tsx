import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import XIcon from './icons/XIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tiersData = [
    {
        name: 'Ücretsiz',
        id: 'free',
        priceMonthly: 0,
        description: 'Scrum metodolojisini öğrenmek ve denemek için.',
        features: {
            'Aktif Proje Sayısı': '1',
            'AI Özellikleri': '10 kullanım',
            'Analytics & Charts': 'Temel',
            'Sprint Geçmişi': '3 ay',
            'Takım İşbirliği': false,
        },
    },
    {
        name: 'Pro',
        id: 'pro',
        priceMonthly: 150,
        description: 'Ciddi kişisel gelişim için tam toolkit.',
        features: {
            'Aktif Proje Sayısı': '5',
            'AI Özellikleri': 'Sınırsız',
            'Analytics & Charts': 'Gelişmiş',
            'Sprint Geçmişi': '12 ay',
            'Takım İşbirliği': false,
        },
        isPrimary: true,
    },
    {
        name: 'Kurumsal',
        id: 'enterprise',
        priceMonthly: 500,
        description: 'Takım liderleri ve koçlar için.',
        features: {
            'Aktif Proje Sayısı': 'Sınırsız',
            'AI Özellikleri': 'AI Mentor',
            'Analytics & Charts': 'Premium',
            'Sprint Geçmişi': 'Sınırsız',
            'Takım İşbirliği': '10 üyeye kadar',
        },
    },
];

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !currentUser) return null;
  
  const handleCheckout = (tierId: 'free' | 'pro' | 'enterprise') => {
      onClose();
      navigate(`/checkout/${tierId}?billing=${billingCycle}`);
  }

  const getButtonState = (tierId: 'free' | 'pro' | 'enterprise') => {
      const currentTierIndex = tiersData.findIndex(t => t.id === currentUser.subscriptionTier);
      const targetTierIndex = tiersData.findIndex(t => t.id === tierId);

      if (currentTierIndex === targetTierIndex) {
          return { text: 'Mevcut Plan', disabled: true, primary: false };
      }
      if (targetTierIndex > currentTierIndex) {
          return { text: 'Yükselt', disabled: false, primary: true };
      }
      return { text: 'Düşür', disabled: false, primary: false };
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Planlar ve Fiyatlandırma</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
            <div className="flex justify-center items-center mb-8">
                <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-primary-600' : 'text-gray-500'}`}>Aylık</span>
                <button onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')} className="mx-4 relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700">
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-primary-600' : 'text-gray-500'}`}>Yıllık</span>
                <span className="ml-2 px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">%15 İndirim</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiersData.map(tier => {
                    const price = billingCycle === 'yearly' ? Math.floor(tier.priceMonthly * 12 * 0.85) : tier.priceMonthly;
                    const buttonState = getButtonState(tier.id as any);
                    return (
                        <div key={tier.name} className={`flex flex-col p-6 rounded-2xl border ${tier.isPrimary ? 'border-primary-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800/50`}>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 h-10">{tier.description}</p>
                            <p className="mt-4">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{price.toLocaleString('tr-TR')}₺</span>
                                <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{billingCycle === 'monthly' ? 'ay' : 'yıl'}</span>
                            </p>
                            <button 
                                onClick={() => handleCheckout(tier.id as any)}
                                disabled={buttonState.disabled}
                                className={`mt-6 w-full py-2 px-4 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600 ${buttonState.primary ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
                            >
                                {buttonState.text}
                            </button>
                            <ul className="mt-6 space-y-4 flex-grow">
                                {Object.entries(tier.features).map(([feature, value]) => (
                                    <li key={feature} className="flex items-start">
                                        {typeof value === 'boolean' ? (
                                            value ? <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                        ) : (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{feature}: <span className="font-medium text-gray-600 dark:text-gray-400">{typeof value !== 'boolean' && value}</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;