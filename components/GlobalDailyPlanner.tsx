import React, { useState, useMemo } from 'react';
import { Project, Sprint, Task } from '../types';
import { getColorClass } from '../utils/colors';
import GlobalDayDetailModal from './GlobalDayDetailModal';
import CalendarDaysIcon from './icons/CalendarDaysIcon';

interface GlobalDailyPlannerProps {
  sprintsWithProjects: { project: Project, sprint: Sprint }[];
  onTaskClick: (taskId: string, sprintId: string, projectId: string) => void;
}

const GlobalDailyPlanner: React.FC<GlobalDailyPlannerProps> = ({ sprintsWithProjects, onTaskClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { weekDays, tasksByDate } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(firstDayOfWeek);
        day.setDate(day.getDate() + i);
        weekDays.push(day);
    }
    
    const tasksByDate = sprintsWithProjects.flatMap(({project, sprint}) => 
        sprint.tasks.map(task => ({...task, projectColor: project.colorTheme, projectId: project.id, sprintId: sprint.id}))
    ).reduce((acc, task) => {
        if (task.plannedDate) {
            (acc[task.plannedDate] = acc[task.plannedDate] || []).push(task);
        }
        return acc;
    }, {} as Record<string, (Task & { projectColor: string, projectId: string, sprintId: string })[]>);

    return { weekDays, tasksByDate };
  }, [sprintsWithProjects]);

  const PlannedTaskPill: React.FC<{ task: Task & { projectColor: string } }> = ({ task }) => {
    const bgColor = getColorClass(task.projectColor, 'bgLight');
    const textColor = getColorClass(task.projectColor, 'textDark');
    return (
      <div
        title={task.title}
        className={`px-2 py-0.5 text-xs rounded-full truncate ${bgColor} ${textColor} font-semibold`}
      >
        {task.title}
      </div>
    );
  };

  return (
    <>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-4">
        <CalendarDaysIcon className="w-6 h-6 text-primary-500 mr-3" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Haftalık Plan</h2>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const plannedTasks = tasksByDate[dateKey] || [];
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 min-h-[120px] border border-transparent hover:border-primary-500 transition-colors cursor-pointer"
            >
              <div className="text-center font-semibold text-xs text-gray-500 dark:text-gray-400">
                {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
              </div>
              <div className={`text-center font-bold text-sm mb-2 ${isToday ? 'text-primary-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {plannedTasks.slice(0, 4).map(task => <PlannedTaskPill key={task.id} task={task} />)}
                {plannedTasks.length > 4 && (
                    <div className="text-xs text-center text-gray-500 font-semibold mt-1">
                        + {plannedTasks.length - 4} daha
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    <GlobalDayDetailModal 
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        tasksByDate={tasksByDate}
        onTaskClick={onTaskClick}
    />
    </>
  );
};

export default GlobalDailyPlanner;
