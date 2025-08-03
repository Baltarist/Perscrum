import React from 'react';
import { Task } from '../types';
import XIcon from './icons/XIcon';
import { getColorClass } from '../utils/colors';
import { useProjectData } from '../hooks/useProjectData';

interface GlobalDayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasksByDate: Record<string, (Task & { projectColor: string, projectId: string, sprintId: string })[]>;
  onTaskClick: (taskId: string, sprintId: string, projectId: string) => void;
}

const GlobalDayDetailModal: React.FC<GlobalDayDetailModalProps> = ({ isOpen, onClose, date, tasksByDate, onTaskClick }) => {
  const { getProjectById } = useProjectData();
  
  if (!isOpen || !date) return null;

  const formattedDate = date.toISOString().split('T')[0];
  const plannedTasks = tasksByDate[formattedDate] || [];

  const handleTaskClick = (task: Task & { projectId: string, sprintId: string }) => {
    onTaskClick(task.id, task.sprintId, task.projectId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Günlük Plan: {date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto">
          {plannedTasks.length > 0 ? (
            plannedTasks.map(task => {
              const project = getProjectById(task.projectId);
              const bgColor = getColorClass(task.projectColor, 'bgLight');
              const textColor = getColorClass(task.projectColor, 'textDark');
              return (
                <div key={task.id} className={`p-3 rounded-lg ${bgColor}`}>
                  <button onClick={() => handleTaskClick(task)} className={`font-semibold ${textColor} hover:underline text-left`}>
                    {task.title}
                  </button>
                  <div className="flex items-center text-xs mt-1">
                      <span className={`w-2 h-2 mr-2 rounded-full ${getColorClass(task.projectColor, 'bg')}`}></span>
                      <span className={`${textColor} opacity-80`}>{project?.title}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Bu gün için planlanmış bir görev yok.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalDayDetailModal;