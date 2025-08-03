import React from 'react';
import { Link } from 'react-router-dom';
import { Project, TaskStatus } from '../types';
import { getColorClass } from '../utils/colors';
import { formatDate, getDateDifference } from '../utils/date';
import TrophyIcon from './icons/TrophyIcon';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Safe access to sprints array
  const sprints = project.sprints || [];
  const activeSprint = sprints.find(s => s.status === 'active');
  const tasks = activeSprint?.tasks || [];
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const dateDiff = getDateDifference(project.estimatedCompletionDate, project.targetCompletionDate);
  const dateStatus = dateDiff > 0 ? `+${dateDiff} gün gecikme` : dateDiff < 0 ? `${-dateDiff} gün erken` : 'Zamanında';
  const dateColor = dateDiff > 0 ? 'text-red-500' : dateDiff < 0 ? 'text-green-500' : 'text-gray-500';

  const statusLabels: { [key: string]: string } = {
    active: 'Aktif',
    paused: 'Duraklatıldı',
    completed: 'Tamamlandı',
  };

  const statusClasses = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }

  return (
    <Link to={`/project/${project.id}`} className="block group">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-4 ${project.status === 'completed' ? 'border-yellow-400' : getColorClass(project.colorTheme, 'border')}`}>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-2">
                {project.title}
              </h3>
               <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[project.status]}`}>
                {statusLabels[project.status] || project.status}
              </span>
            </div>
            
             <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Sprint {activeSprint?.sprintNumber || 'Yok'} / {project.totalSprints}</span>
                {project.status === 'completed' ? (
                     <span className="flex items-center font-bold text-yellow-500">
                         <TrophyIcon className="w-4 h-4 mr-1"/> Tamamlandı!
                     </span>
                ) : (
                    <span className={dateColor}>{dateStatus}</span>
                )}
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                <span>Sprint İlerlemesi</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColorClass(project.colorTheme, 'bg')}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
    </Link>
  );
};

export default ProjectCard;