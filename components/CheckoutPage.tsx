import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PaymentMethod } from '../types';

const tiersData = {
    pro: { name: 'Pro', priceMonthly: 150 },
    enterprise: { name: 'Kurumsal', priceMonthly: 500 },
};

const CheckoutPage: React.FC = () => {
    const { tier } = useParams<{ tier: 'pro' | 'enterprise' }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, updateSubscription, updatePaymentMethod } = useAuth();
    
    const billingCycle = searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly';
    
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
        cardNumber: '', expiryDate: '', cvc: '', cardHolder: ''
    });

    useEffect(() => {
        if (currentUser?.paymentMethod) {
            setPaymentMethod(currentUser.paymentMethod);
        }
    }, [currentUser]);

    if (!tier || !tiersData[tier] || !currentUser) {
        return <div className="p-6">Geçersiz ödeme sayfası.</div>;
    }

    const tierInfo = tiersData[tier];
    const price = billingCycle === 'yearly' ? Math.floor(tierInfo.priceMonthly * 12 * 0.85) : tierInfo.priceMonthly;
    const period = billingCycle === 'yearly' ? 'yıl' : 'ay';

    const handlePurchase = () => {
        // Here you would typically integrate with a real payment gateway
        // For this mock, we just update the user's subscription and payment method
        updatePaymentMethod(paymentMethod);
        updateSubscription(tier, billingCycle);
        alert(`${tierInfo.name} planına başarıyla yükseltildi!`);
        navigate('/subscription');
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sipariş Özeti</h2>
                <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">{tierInfo.name} Planı ({billingCycle === 'yearly' ? 'Yıllık' : 'Aylık'})</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{price.toLocaleString('tr-TR')}₺</span>
                </div>
                 <div className="flex justify-between items-center font-bold text-lg pt-4">
                    <span className="text-gray-800 dark:text-white">Toplam</span>
                    <span className="text-primary-600 dark:text-primary-400">{price.toLocaleString('tr-TR')}₺/{period}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bu, yinelenen bir aboneliktir. İptal edilmediği sürece her {period} otomatik olarak yenilenir.
                </p>
            </div>
            {/* Payment Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ödeme Bilgileri</h2>
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
                     <div className="pt-4">
                        <button onClick={handlePurchase} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
                           Aboneliği Onayla ve Öde
                        </button>
                         <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                           <Link to="/legal/kvkk" className="underline">KVKK</Link> ve <Link to="/legal/iade" className="underline">İade Politikası</Link>'nı kabul ediyorum.
                        </p>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default CheckoutPage;