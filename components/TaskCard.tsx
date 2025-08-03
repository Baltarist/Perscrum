import React from 'react';
import { Task, TaskStatus } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import CheckIcon from './icons/CheckIcon';
import { useAuth } from '../hooks/useAuth';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isStale: boolean;
  onStaleClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isStale, onStaleClick }) => {
  const { getUserById } = useAuth();
  const creator = getUserById(task.createdBy);
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleStaleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the task detail modal
    onStaleClick();
  };

  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  const isDraggable = task.status !== TaskStatus.Done;

  return (
    <div
      draggable={isDraggable}
      onClick={onClick}
      onDragStart={handleDragStart}
      className={`relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${isDraggable ? 'cursor-pointer active:cursor-grabbing' : 'cursor-default opacity-80'}`}
    >
      {isStale && (
        <button
          onClick={handleStaleClick}
          className="absolute top-2 right-2 p-1 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-colors"
          title="Bu görevde takıldın mı? AI'dan yardım al."
        >
          <AlertTriangleIcon className="w-4 h-4" />
        </button>
      )}
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 pr-8">{task.title}</h4>
      {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
      
      {task.aiComments && task.aiComments.length > 0 && (
          <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md flex items-start space-x-2">
              <SparklesIcon className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-purple-700 dark:text-purple-300 italic">{task.aiComments[0].text}</p>
          </div>
      )}

      {totalSubtasks > 0 && (
          <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Alt Görevler</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{width: `${subtaskProgress}%`}}></div>
              </div>
          </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
        {task.storyPoints && <span className="text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">{task.storyPoints} puan</span>}
        <div className="flex items-center -space-x-1">
            {creator && (
                 <div className="relative" title={`Oluşturan: ${creator.displayName}`}>
                    <img className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" src={`https://picsum.photos/seed/${creator.id}/40/40`} alt={creator.displayName}/>
                    {task.isAiAssisted && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 rounded-full p-px"><SparklesIcon className="w-3 h-3 text-purple-500" /></div>}
                </div>
            )}
            {assignee && assignee.id !== creator?.id && (
                 <img className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" src={`https://picsum.photos/seed/${assignee.id}/40/40`} alt={assignee.displayName} title={`Atanan: ${assignee.displayName}`}/>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;