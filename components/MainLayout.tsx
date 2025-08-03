import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useProjectData } from '../hooks/useProjectData';
import NewBadgeModal from './NewBadgeModal';
import ProjectReviewModal from './ProjectReviewModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { newlyEarnedBadge, clearNewlyEarnedBadge, projectUnderReview, closeProjectReview, confirmProjectCompletion } = useProjectData();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
      
      {/* Modals */}
      <NewBadgeModal 
        isOpen={!!newlyEarnedBadge && !projectUnderReview}
        badge={newlyEarnedBadge}
        onClose={clearNewlyEarnedBadge}
      />
      <ProjectReviewModal 
        isOpen={!!projectUnderReview}
        project={projectUnderReview}
        earnedBadge={newlyEarnedBadge}
        onClose={closeProjectReview}
        onConfirm={confirmProjectCompletion}
      />
    </div>
  );
};

export default MainLayout;