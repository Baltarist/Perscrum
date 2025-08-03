import React from 'react';
import { Project, Task, TaskStatus } from '../types';
import TargetIcon from './icons/TargetIcon';
import { Link } from 'react-router-dom';
import { getColorClass } from '../utils/colors';

interface FocusItem {
  task: Task;
  project: Project;
}

interface TodaysFocusProps {
  focusItems: FocusItem[];
  dailyFocusId?: string;
}

const TodaysFocus: React.FC<TodaysFocusProps> = ({ focusItems, dailyFocusId }) => {
  const dailyFocusItem = dailyFocusId ? focusItems.find(item => item.task.id === dailyFocusId) : null;
  const otherItems = focusItems.filter(item => item.task.id !== dailyFocusId).slice(0, 4);

  if (focusItems.length === 0) {
    return null;
  }
  
  const FocusItemCard: React.FC<{item: FocusItem, isDailyFocus: boolean}> = ({item, isDailyFocus}) => (
      <Link 
        to={`/project/${item.project.id}`} 
        className={`block p-3 rounded-lg shadow-sm transition-all duration-300 ${isDailyFocus ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
      >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{item.task.title}</p>
             {item.task.status === TaskStatus.InProgress && <span className="px-2 py-0.5 text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-full">Devam Ediyor</span>}
             {isDailyFocus && <span className="px-2 py-0.5 text-xs font-medium text-primary-800 bg-primary-100 dark:text-primary-200 dark:bg-primary-900/50 rounded-full">AI Odak</span>}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className={`w-2 h-2 mr-2 rounded-full ${getColorClass(item.project.colorTheme, 'bg')}`}></span>
              <span>{item.project.title}</span>
          </div>
      </Link>
  )

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-4">
        <TargetIcon className="w-6 h-6 text-primary-500 mr-3" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bugünün Odağı</h2>
      </div>
      <div className="space-y-3">
        {dailyFocusItem && <FocusItemCard item={dailyFocusItem} isDailyFocus={true} />}
        {otherItems.map(item => <FocusItemCard key={item.task.id} item={item} isDailyFocus={false} />)}
      </div>
    </div>
  );
};

export default TodaysFocus;