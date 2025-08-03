import React, { useState } from 'react';
import { Sprint, Task, TaskStatus, Project } from '../types';
import XIcon from './icons/XIcon';
import FlagIcon from './icons/FlagIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getAIRetrospectiveSuggestions } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';

interface SprintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  activeSprint: Sprint;
  onComplete: (retrospective: { good: string; improve: string; }) => void;
}

const SprintReviewModal: React.FC<SprintReviewModalProps> = ({ isOpen, onClose, project, activeSprint, onComplete }) => {
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState('');
  const [isSuggestingRetro, setIsSuggestingRetro] = useState(false);
  const { currentUser } = useAuth();
  
  if (!isOpen) return null;

  const completedTasks = activeSprint.tasks.filter(t => t.status === TaskStatus.Done);
  const incompleteTasks = activeSprint.tasks.filter(t => t.status !== TaskStatus.Done);
  
  const handleSubmit = () => {
    onComplete({
      good: whatWentWell,
      improve: whatCouldBeImproved
    });
    // Reset state after completion
    setWhatWentWell('');
    setWhatCouldBeImproved('');
  };
  
  const handleGetRetroSuggestions = async () => {
    if (!currentUser) return;
    setIsSuggestingRetro(true);
    try {
        const suggestions = await getAIRetrospectiveSuggestions(project.title, activeSprint, currentUser.settings.aiCoachName);
        if (suggestions) {
            setWhatWentWell(suggestions.good.map(s => `- ${s}`).join('\n'));
            setWhatCouldBeImproved(suggestions.improve.map(s => `- ${s}`).join('\n'));
        }
    } catch (error) {
        console.error("AI retrospektif önerileri alınamadı:", error);
    } finally {
        setIsSuggestingRetro(false);
    }
  };

  const MiniTaskCard: React.FC<{task: Task}> = ({task}) => (
      <div className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md text-sm text-gray-700 dark:text-gray-300">
          {task.title}
      </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <FlagIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sprint {activeSprint.sprintNumber} Değerlendirmesi</h2>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">✅ Tamamlanan Görevler ({completedTasks.length})</h3>
                    <div className="space-y-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg max-h-40 overflow-y-auto">
                        {completedTasks.length > 0 ? completedTasks.map(t => <MiniTaskCard key={t.id} task={t}/>) : <p className="text-sm text-gray-500 p-2">Bu sprintte hiç görev tamamlanmadı.</p>}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">➡️ Devreden Görevler ({incompleteTasks.length})</h3>
                     <div className="space-y-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg max-h-40 overflow-y-auto">
                        {incompleteTasks.length > 0 ? incompleteTasks.map(t => <MiniTaskCard key={t.id} task={t}/>) : <p className="text-sm text-gray-500 p-2">Tüm görevler tamamlandı, harika iş!</p>}
                    </div>
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Retrospektif</h3>
                    <button 
                        onClick={handleGetRetroSuggestions} 
                        disabled={isSuggestingRetro}
                        className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800 dark:hover:text-purple-300 disabled:opacity-50"
                    >
                        <SparklesIcon className={`w-4 h-4 ${isSuggestingRetro ? 'animate-pulse' : ''}`} />
                        <span>{isSuggestingRetro ? 'Analiz Ediliyor...' : 'AI Önerileri Al'}</span>
                    </button>
                 </div>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="whatWentWell" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neler iyi gitti?</label>
                        <textarea
                            id="whatWentWell"
                            value={whatWentWell}
                            onChange={(e) => setWhatWentWell(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Bu sprintteki başarılarınızı ve olumlu yönleri not alın..."
                        />
                    </div>
                    <div>
                        <label htmlFor="whatCouldBeImproved" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neler geliştirilebilir?</label>
                        <textarea
                            id="whatCouldBeImproved"
                            value={whatCouldBeImproved}
                            onChange={(e) => setWhatCouldBeImproved(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            placeholder="Gelecek sprintte neleri daha iyi yapabileceğinizi düşünün..."
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                İptal
            </button>
            <button onClick={handleSubmit} className="flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">
              <FlagIcon className="w-5 h-5"/>
              <span>Yeni Sprint'e Başla</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SprintReviewModal;