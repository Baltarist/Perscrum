import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjectData } from '../hooks/useProjectData';
import { UserSettings } from '../types';
import { generateICS } from '../utils/ics';
import Share2Icon from './icons/Share2Icon';
import ClipboardIcon from './icons/ClipboardIcon';
import DownloadIcon from './icons/DownloadIcon';
import CreditCardIcon from './icons/CreditCardIcon';

const SettingsPage: React.FC = () => {
  const { currentUser, updateUserSettings } = useAuth();
  const { projects } = useProjectData();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("URL'yi Kopyala");

  useEffect(() => {
    if (currentUser) {
      setSettings(currentUser.settings);
    }
  }, [currentUser]);

  if (!currentUser || !settings) {
    return <div>Yükleniyor...</div>;
  }
  
  const subscriptionUrl = `webcal://scrum-coach.ai/calendar/${currentUser.id}/feed.ics`;

  const handleSave = () => {
    if (settings) {
      updateUserSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  }
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subscriptionUrl);
    setCopyButtonText('Kopyalandı!');
    setTimeout(() => setCopyButtonText("URL'yi Kopyala"), 2000);
  };

  const handleDownload = () => {
    const icsContent = generateICS(projects, currentUser);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scrum_kocu_takvim.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Uygulama deneyimini kendi çalışma tarzına göre kişiselleştir.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-6">
        
        {/* Kişiselleştirme Ayarları */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kişiselleştirme</h2>
           <div className="mt-4">
                <label htmlFor="ai-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">AI Koç Adı</label>
                <input
                  type="text"
                  id="ai-name"
                  value={settings.aiCoachName}
                  onChange={(e) => handleSettingChange('aiCoachName', e.target.value)}
                  className="mt-1 block w-full max-w-xs p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Örn: Athena"
                />
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Sprint Ayarları */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Proje Ayarları</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Yeni oluşturulacak projeler için varsayılan sprint süresini belirle.</p>
          <div className="mt-4 flex space-x-4">
            {[1, 2].map(week => (
                <div key={week}>
                    <input type="radio" id={`sprint-${week}-week`} name="sprintDuration" value={week} checked={settings.sprintDurationWeeks === week} onChange={() => handleSettingChange('sprintDurationWeeks', week)} className="hidden"/>
                    <label htmlFor={`sprint-${week}-week`} className={`block p-4 rounded-lg border-2 cursor-pointer ${settings.sprintDurationWeeks === week ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{week} Hafta</span>
                        <span className="block text-sm text-gray-600 dark:text-gray-300">{week === 1 ? 'Hızlı tempolu projeler.' : 'Kapsamlı hedefler için.'}</span>
                    </label>
                </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Abonelik Ayarları */}
        {currentUser.subscriptionTier !== 'free' && (
            <div>
              <div className="flex items-center">
                <CreditCardIcon className="w-6 h-6 text-primary-500 mr-3"/>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Abonelik</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mevcut planını yönet ve ödeme yöntemlerini güncelle.</p>
              <div className="mt-4">
                  <Link to="/subscription" className="inline-block py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Aboneliği Yönet</Link>
              </div>
            </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Takvim Ayarları */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Otomatik Toplantı Planlama</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label htmlFor="daily-checkin-toggle" className="font-medium text-gray-800 dark:text-gray-100">Günlük AI Check-in Toplantısı</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Her gün belirli bir saatte takvimine bir etkinlik ekle.</p>
              </div>
              <div className="flex items-center space-x-3">
                 <input type="time" id="daily-checkin-time" value={settings.dailyCheckinTime} onChange={(e) => handleSettingChange('dailyCheckinTime', e.target.value)} disabled={!settings.dailyCheckinEnabled} className="p-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50"/>
                 <label htmlFor="daily-checkin-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="daily-checkin-toggle" className="sr-only peer" checked={settings.dailyCheckinEnabled} onChange={(e) => handleSettingChange('dailyCheckinEnabled', e.target.checked)}/>
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label htmlFor="retro-toggle" className="font-medium text-gray-800 dark:text-gray-100">Retrospektif Toplantısı</label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Her sprintin son gününe bir retrospektif toplantısı ekle.</p>
              </div>
              <label htmlFor="retro-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="retro-toggle" className="sr-only peer" checked={settings.retrospectiveEnabled} onChange={(e) => handleSettingChange('retrospectiveEnabled', e.target.checked)}/>
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Takvim Entegrasyonu */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Takvim Entegrasyonu</h2>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kişisel Takvim Abonelik URL'si</label>
              <div className="flex space-x-2 mt-1">
                <input type="text" readOnly value={subscriptionUrl} className="w-full p-2 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm text-gray-500 dark:text-gray-400"/>
                <button onClick={handleCopyUrl} className="flex items-center space-x-2 py-2 px-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"><ClipboardIcon className="w-4 h-4" /><span>{copyButtonText}</span></button>
                <button onClick={handleDownload} className="flex items-center space-x-2 py-2 px-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"><DownloadIcon className="w-4 h-4" /><span>.ics</span></button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Yasal */}
        <div>
             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Yasal</h2>
             <div className="mt-2 space-x-4">
                <Link to="/legal/kvkk" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Kişisel Verilerin Korunması</Link>
                <Link to="/legal/iade" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">İade Politikası</Link>
             </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          {isSaved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;