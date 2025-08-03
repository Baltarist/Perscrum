import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { getColorClass } from '../utils/colors';
import DashboardIcon from './icons/DashboardIcon';
import ProjectIcon from './icons/ProjectIcon';
import AnalyticsIcon from './icons/AnalyticsIcon';
import PricingModal from './PricingModal';
import CalendarIcon from './icons/CalendarIcon';
import SettingsIcon from './icons/SettingsIcon';

const Sidebar: React.FC = () => {
  const { projects } = useProjectData();
  const { currentUser } = useAuth();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  if (!currentUser) return null;
  
  const activeProjects = projects.filter(p => p.status === 'active');

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const getUpgradeContent = () => {
      switch (currentUser.subscriptionTier) {
          case 'free':
              return {
                  title: "Pro'ya Yükselt",
                  description: "Gelişmiş analizlerin ve sınırsız AI özelliklerinin kilidini açın.",
                  buttonText: "Daha Fazla Bilgi"
              };
          case 'pro':
              return {
                  title: "Kurumsal'a Yükselt",
                  description: "Takım iş birliği ve API erişimi gibi özellikleri etkinleştirin.",
                  buttonText: "Yükselt"
              };
          case 'enterprise':
              return null; // Don't show the box for enterprise users
          default:
              return null;
      }
  }

  const upgradeContent = getUpgradeContent();

  return (
    <>
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center space-x-2 px-2">
        <div className="p-2 bg-primary-500 rounded-lg">
          <ProjectIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Scrum Koçu</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/dashboard" className={navLinkClasses}>
          <DashboardIcon className="w-5 h-5 mr-3" />
          Kontrol Paneli
        </NavLink>
        <NavLink to="/calendar" className={navLinkClasses}>
          <CalendarIcon className="w-5 h-5 mr-3" />
          Takvim
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
          <SettingsIcon className="w-5 h-5 mr-3" />
          Ayarlar
        </NavLink>
        
        <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Aktif Projeler
        </div>

        {activeProjects.map((project) => (
          <NavLink
            key={project.id}
            to={`/project/${project.id}`}
            className={navLinkClasses}
          >
            <span className={`w-2 h-2 mr-3 rounded-full ${getColorClass(project.colorTheme, 'bg')}`}></span>
            {project.title}
          </NavLink>
        ))}

        <div className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Analiz
        </div>
        <NavLink to="/analytics" className={navLinkClasses}>
          <AnalyticsIcon className="w-5 h-5 mr-3" />
          Analiz
        </NavLink>
      </nav>
      
      {upgradeContent && (
          <div className="p-4 bg-primary-50 dark:bg-gray-700 rounded-lg text-center">
              <h3 className="font-bold text-primary-800 dark:text-primary-200">{upgradeContent.title}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-300 mt-1">{upgradeContent.description}</p>
              <button onClick={() => setIsPricingModalOpen(true)} className="mt-3 w-full bg-primary-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">{upgradeContent.buttonText}</button>
          </div>
      )}
    </div>
    <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
    </>
  );
};

export default Sidebar;