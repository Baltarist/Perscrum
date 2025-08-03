import React, { useState } from 'react';
import { Sprint, Task } from '../types';
import { getStatusColorClasses } from '../utils/taskStatusColors';
import DayDetailModal from './DayDetailModal';
import { useProjectData } from '../hooks/useProjectData';

interface SprintDailyPlannerProps {
  sprint: Sprint;
  projectId: string;
  onTaskClick: (taskId: string, sprintId: string) => void;
}

const SprintDailyPlanner: React.FC<SprintDailyPlannerProps> = ({ sprint, projectId, onTaskClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  if (!sprint.startDate || !sprint.endDate) {
    return null;
  }

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  
  const days: Date[] = [];
  const currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const finalDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));

  while (currentDate <= finalDate) {
    days.push(new Date(currentDate));
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  const tasksByDate = sprint.tasks.reduce((acc, task) => {
    if (task.plannedDate) {
      (acc[task.plannedDate] = acc[task.plannedDate] || []).push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);
  
  // onDropTask is now accessed via context
  const { planTaskForDay } = useProjectData();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary-100', 'dark:bg-primary-900/50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove('bg-primary-100', 'dark:bg-primary-900/50');
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary-100', 'dark:bg-primary-900/50');
    const taskId = e.dataTransfer.getData('taskId');
    const dateString = date.toISOString().split('T')[0];
    planTaskForDay(projectId, sprint.id, taskId, dateString);
  };
  
  const PlannedTaskPill: React.FC<{ task: Task }> = ({ task }) => {
    const { bg, text } = getStatusColorClasses(task.status);
    return (
      <div
        title={task.title}
        className={`px-2 py-0.5 text-xs rounded-full truncate ${bg} ${text} font-semibold`}
      >
        {task.title}
      </div>
    );
  };

  return (
    <>
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-3">Günlük Planlayıcı</h3>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(100px, 1fr))` }}>
        {days.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const plannedTasks = tasksByDate[dateKey] || [];
          return (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
              onClick={() => setSelectedDate(day)}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 min-h-[100px] border border-transparent hover:border-primary-500 transition-colors cursor-pointer"
            >
              <div className="text-center font-semibold text-xs text-gray-500 dark:text-gray-400">
                {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
              </div>
              <div className="text-center font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">
                {day.getUTCDate()}
              </div>
              <div className="space-y-1">
                {plannedTasks.slice(0, 3).map(task => <PlannedTaskPill key={task.id} task={task} />)}
                {plannedTasks.length > 3 && (
                    <div className="text-xs text-center text-gray-500 font-semibold mt-1">
                        + {plannedTasks.length - 3} daha
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <DayDetailModal 
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        sprint={sprint}
        projectId={projectId}
        onTaskClick={onTaskClick}
    />
    </>
  );
};

export default SprintDailyPlanner;
