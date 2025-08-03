import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod } from '../types';
import { formatDate } from '../utils/date';
import XIcon from './icons/XIcon';
import CreditCardIcon from './icons/CreditCardIcon';

const SubscriptionPage: React.FC = () => {
    const { currentUser, updatePaymentMethod, updateSubscription } = useAuth();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        cardHolder: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (currentUser?.paymentMethod) {
            setPaymentMethod(currentUser.paymentMethod);
        } else {
            setIsEditing(true);
        }
    }, [currentUser]);

    if (!currentUser) {
        return <div>Yükleniyor...</div>;
    }

    const tierNameMap = {
        free: 'Ücretsiz',
        pro: 'Pro',
        enterprise: 'Kurumsal'
    };

    const handleSave = () => {
        updatePaymentMethod(paymentMethod);
        setIsEditing(false);
    };
    
    const handleDowngrade = () => {
        if (window.confirm(`Mevcut aboneliğinizi iptal etmek istediğinizden emin misiniz? ${tierNameMap[currentUser.subscriptionTier]} planınız ${formatDate(currentUser.subscriptionEndDate || '')} tarihine kadar geçerli olmaya devam edecek.`)) {
            updateSubscription('free', 'monthly');
            navigate('/settings');
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aboneliği Yönet</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Planınızı görüntüleyin, ödeme yönteminizi güncelleyin veya aboneliğinizi değiştirin.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mevcut Plan */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Mevcut Plan</h2>
                    <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-300">{tierNameMap[currentUser.subscriptionTier]}</p>
                        {currentUser.subscriptionEndDate && (
                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Yenilenme Tarihi: {formatDate(currentUser.subscriptionEndDate)}</p>
                        )}
                    </div>
                    <div className="mt-4 space-x-2">
                        <button onClick={() => navigate('/dashboard')} className="py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Planları Karşılaştır</button>
                        {currentUser.subscriptionTier !== 'free' && (
                            <button onClick={handleDowngrade} className="py-2 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">Aboneliği İptal Et</button>
                        )}
                    </div>
                </div>

                {/* Ödeme Yöntemi */}
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ödeme Yöntemi</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="text-sm text-primary-600 hover:underline">Düzenle</button>
                        )}
                    </div>
                    {isEditing ? (
                         <div className="mt-4 space-y-3">
                             <div>
                                <label className="text-sm font-medium">Kart Sahibi</label>
                                <input type="text" value={paymentMethod.cardHolder} onChange={e => setPaymentMethod(p => ({...p, cardHolder: e.target.value}))} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                             </div>
                             <div>
                                <label className="text-sm font-medium">Kart Numarası</label>
                                <input type="text" value={paymentMethod.cardNumber} onChange={e => setPaymentMethod(p => ({...p, cardNumber: e.target.value}))} placeholder="**** **** **** 1234" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                             </div>
                             <div className="flex space-x-2">
                                 <div>
                                    <label className="text-sm font-medium">Son Kul. Tar.</label>
                                    <input type="text" value={paymentMethod.expiryDate} onChange={e => setPaymentMethod(p => ({...p, expiryDate: e.target.value}))} placeholder="AA/YY" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                                 </div>
                                  <div>
                                    <label className="text-sm font-medium">CVC</label>
                                    <input type="text" value={paymentMethod.cvc} onChange={e => setPaymentMethod(p => ({...p, cvc: e.target.value}))} placeholder="123" className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                                 </div>
                             </div>
                             <div className="flex space-x-2">
                                <button onClick={handleSave} className="py-2 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">Kaydet</button>
                                {currentUser.paymentMethod && <button onClick={() => setIsEditing(false)} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">İptal</button>}
                             </div>
                         </div>
                    ) : (
                         <div className="mt-4 p-4 flex items-center space-x-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <CreditCardIcon className="w-8 h-8 text-gray-500"/>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{paymentMethod.cardNumber}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Son kullanma tarihi {paymentMethod.expiryDate}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;