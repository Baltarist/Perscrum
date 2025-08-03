import React, { useState, useEffect } from 'react';
import { Task, Sprint } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import { useProjectData } from '../hooks/useProjectData';
import { useParams } from 'react-router-dom';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (sprintId: string, taskData: Omit<Task, 'id' | 'subtasks' | 'aiComments' | 'notes' | 'createdBy' | 'statusHistory' | 'isAiAssisted' | 'status' | 'assigneeId'>) => void;
  projectId: string;
  activeSprintId?: string;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask, projectId, activeSprintId }) => {
  const { getProjectById } = useProjectData();
  const project = getProjectById(projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [selectedSprintId, setSelectedSprintId] = useState(activeSprintId || '');

  useEffect(() => {
      // Ensure a sprint is selected if activeSprintId is available
      if(isOpen && activeSprintId) {
          setSelectedSprintId(activeSprintId);
      }
      // If there's no active sprint, default to the first available sprint
      else if (isOpen && project?.sprints && project.sprints.length > 0 && !activeSprintId) {
          setSelectedSprintId(project.sprints.find(s => s.status === 'planning' || s.status === 'active')?.id || project.sprints[0].id)
      }
  }, [isOpen, activeSprintId, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSprintId) return;
    onAddTask(selectedSprintId, { title, description, storyPoints });
    setTitle('');
    setDescription('');
    setStoryPoints(undefined);
    onClose();
  };
  
  if (!isOpen || !project) return null;
  
  const availableSprints = project.sprints.filter(s => s.status === 'active' || s.status === 'planning');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Görev Oluştur</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Görev Başlığı</label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Örn: Proje yapısını kur"
              required
            />
          </div>
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama (İsteğe bağlı)</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Görev hakkında daha fazla ayrıntı ekleyin."
            />
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="story-points" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hikaye Puanı (İsteğe bağlı)</label>
              <input
                type="number"
                id="story-points"
                value={storyPoints === undefined ? '' : storyPoints}
                onChange={(e) => setStoryPoints(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                min="0"
                className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Örn: 3"
              />
            </div>
            <div>
                 <label htmlFor="sprint-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sprint Ata</label>
                 <select 
                    id="sprint-select"
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                 >
                     {availableSprints.map(sprint => (
                         <option key={sprint.id} value={sprint.id}>Sprint {sprint.sprintNumber}</option>
                     ))}
                 </select>
            </div>
           </div>
          <div className="pt-4 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                İptal
            </button>
            <button type="submit" disabled={!title.trim() || !selectedSprintId} className="flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:bg-primary-300">
              <PlusIcon className="w-5 h-5"/>
              <span>Görev Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
