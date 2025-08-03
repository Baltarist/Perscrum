import React from 'react';
import { Project, Badge, TaskStatus } from '../types';
import XIcon from './icons/XIcon';
import TrophyIcon from './icons/TrophyIcon';
import { formatDate, getDateDifference } from '../utils/date';

interface ProjectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  earnedBadge: Badge | null;
  onConfirm: (projectId: string) => void;
}

const ProjectReviewModal: React.FC<ProjectReviewModalProps> = ({ isOpen, onClose, project, earnedBadge, onConfirm }) => {
  if (!isOpen || !project) return null;

  const allTasks = project.sprints.flatMap(s => s.tasks);
  const completedTasksCount = allTasks.filter(t => t.status === TaskStatus.Done).length;
  const completedSprintsCount = project.sprints.filter(s => s.status === 'completed').length;
  const totalStoryPoints = project.sprints.reduce((acc, sprint) => acc + (sprint.velocityPoints || 0), 0);
  
  const dateDiff = getDateDifference(project.estimatedCompletionDate, project.targetCompletionDate);
  const finalStatusText = dateDiff > 0 ? `${dateDiff} gün gecikmeyle tamamlandı.` : dateDiff < 0 ? `${-dateDiff} gün erken tamamlandı!` : 'Tam zamanında tamamlandı!';
  const finalStatusColor = dateDiff > 0 ? 'text-red-500' : dateDiff < 0 ? 'text-green-500' : 'text-primary-500';


  const handleConfirm = () => {
      onConfirm(project.id);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] transform scale-95 transition-transform duration-300" style={{ animation: 'scaleUp 0.3s ease-out forwards' }}>
        <style>{`@keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        
        <div className="p-4 flex justify-end items-center">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="px-8 pb-8 text-center">
            {earnedBadge ? (
                <>
                    <h2 className="text-xl font-bold text-primary-500">PROJE TAMAMLANDI VE YENİ ROZET!</h2>
                     <div className="my-4 animate-pulse" style={{ animationDuration: '2s' }}>
                        <span className="text-8xl">{earnedBadge.icon}</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{earnedBadge.name}</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{earnedBadge.criteria}</p>
                </>
            ) : (
                 <>
                    <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Tebrikler, projeyi tamamladın!</h2>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">"{project.title}" hedefine ulaştın.</p>
                </>
            )}
        </div>

        <div className="px-8 pb-8 space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center border-t pt-6 border-gray-200 dark:border-gray-700">Proje Özeti</h4>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="font-medium text-gray-600 dark:text-gray-400">Durum:</div>
                <div className={`font-bold ${finalStatusColor}`}>{finalStatusText}</div>
                
                <div className="font-medium text-gray-600 dark:text-gray-400">Tamamlanan Sprint Sayısı:</div>
                <div className="font-bold text-gray-900 dark:text-white">{completedSprintsCount} / {project.totalSprints}</div>
                
                <div className="font-medium text-gray-600 dark:text-gray-400">Tamamlanan Görev Sayısı:</div>
                <div className="font-bold text-gray-900 dark:text-white">{completedTasksCount}</div>

                <div className="font-medium text-gray-600 dark:text-gray-400">Toplam Hikaye Puanı:</div>
                <div className="font-bold text-gray-900 dark:text-white">{totalStoryPoints}</div>
            </div>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <button 
                onClick={handleConfirm}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            >
                <TrophyIcon className="w-5 h-5"/>
                <span>Harika! Kapat</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectReviewModal;