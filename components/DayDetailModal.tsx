import React from 'react';
import { Sprint, Task } from '../types';
import { useProjectData } from '../hooks/useProjectData';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import { getStatusColorClasses } from '../utils/taskStatusColors';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  sprint: Sprint;
  projectId: string;
  onTaskClick: (taskId: string, sprintId: string) => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, sprint, projectId, onTaskClick }) => {
  const { planTaskForDay, unplanTask } = useProjectData();

  if (!isOpen || !date) return null;

  const formattedDate = date.toISOString().split('T')[0];
  const plannedTasks = sprint.tasks.filter(t => t.plannedDate === formattedDate);

  const sprintDays: { label: string, value: string }[] = [];
  const startDate = new Date(sprint.startDate!);
  const endDate = new Date(sprint.endDate!);
  const currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const finalDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

  while (currentDate <= finalDate) {
    sprintDays.push({
      label: new Date(currentDate).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: new Date(currentDate).toISOString().split('T')[0],
    });
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  const handleMoveTask = (taskId: string, newDate: string) => {
    planTaskForDay(projectId, sprint.id, taskId, newDate);
  };

  const handleUnplanTask = (taskId: string) => {
    unplanTask(projectId, sprint.id, taskId);
  };
  
  const handleTaskClick = (task: Task) => {
    onTaskClick(task.id, sprint.id);
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
              const { bg, text } = getStatusColorClasses(task.status);
              return (
                <div key={task.id} className={`p-3 rounded-lg flex items-center justify-between ${bg}`}>
                  <button onClick={() => handleTaskClick(task)} className={`font-semibold ${text} hover:underline text-left`}>
                    {task.title}
                  </button>
                  <div className="flex items-center space-x-2">
                    <select
                      value={task.plannedDate}
                      onChange={(e) => handleMoveTask(task.id, e.target.value)}
                      className="bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-gray-600 rounded-md text-xs py-1 px-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {sprintDays.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUnplanTask(task.id)}
                      title="Günden Kaldır"
                      className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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

export default DayDetailModal;
