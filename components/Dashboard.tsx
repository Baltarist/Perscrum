import React, { useState, useMemo } from 'react';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import ProjectCard from './ProjectCard';
import BadgeComponent from './Badge';
import PlusIcon from './icons/PlusIcon';
import NewProjectModal from './NewProjectModal';
import { Project, Badge, TaskStatus, Task, Sprint, EducationalContent } from '../types';
import { getBadgeById } from '../services/badgeService';
import TodaysFocus from './TodaysFocus';
import { Part } from '@google/genai';
import GlobalDailyPlanner from './GlobalDailyPlanner';
import TaskDetailModal from './TaskDetailModal';
import { searchEducationalContent } from '../services/geminiService';
import EducationalContentModal from './EducationalContentModal';

type NewProjectDataForModal = Omit<Project, 'id' | 'sprints' | 'status' | 'estimatedCompletionDate' | 'totalSprints' | 'sprintDurationWeeks' | 'teamMembers'> & { weeklyHourCommitment: number, filePart?: Part };


const Dashboard: React.FC = () => {
  const { projects, addProject, isCreatingProject } = useProjectData();
  const { currentUser } = useAuth();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedTaskInfo, setSelectedTaskInfo] = useState<{taskId: string, sprintId: string, projectId: string} | null>(null);

  const [educationalContent, setEducationalContent] = useState<EducationalContent | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentRequestTaskId, setContentRequestTaskId] = useState<string | null>(null);


  if (!currentUser) {
    return null; // or a loading spinner
  }

  const handleAddProject = async (projectData: NewProjectDataForModal) => {
    await addProject(projectData);
    setIsNewProjectModalOpen(false);
  };
  
  const userBadges = currentUser.badges
    .map(badgeId => getBadgeById(badgeId))
    .filter((badge): badge is Badge => !!badge);
  
  const focusItems = useMemo(() => {
    const allFocusTasks = projects
      .filter(p => p.status === 'active')
      .flatMap(p => 
          p.sprints.find(s => s.status === 'active')?.tasks.map(t => ({ task: t, project: p })) || []
      );
    
    let dailyFocusItem = null;
    if (currentUser.dailyFocusTaskId) {
      dailyFocusItem = allFocusTasks.find(item => item.task.id === currentUser.dailyFocusTaskId);
    }
    
    const otherInProgressTasks = allFocusTasks.filter(item => item.task.status === TaskStatus.InProgress && item.task.id !== currentUser.dailyFocusTaskId);
    const otherTodoTasks = allFocusTasks.filter(item => item.task.status === TaskStatus.Todo && item.task.id !== currentUser.dailyFocusTaskId);

    const sortedItems = [];
    if (dailyFocusItem) sortedItems.push(dailyFocusItem);
    sortedItems.push(...otherInProgressTasks, ...otherTodoTasks);
    
    return sortedItems;
  }, [projects, currentUser.dailyFocusTaskId]);

  const allActiveSprints = useMemo(() => {
    return projects
      .filter(p => p.status === 'active')
      .map(p => ({
        project: p,
        sprint: p.sprints.find(s => s.status === 'active')
      }))
      .filter(item => item.sprint) as { project: Project, sprint: Sprint }[];
  }, [projects]);
  
  const handleTaskClick = (taskId: string, sprintId: string, projectId: string) => {
    setSelectedTaskInfo({ taskId, sprintId, projectId });
  };

  const handleFindContentClick = async (taskId: string) => {
    let taskToFind: Task | undefined;
    for (const project of projects) {
        for (const sprint of project.sprints) {
            const foundTask = sprint.tasks.find(t => t.id === taskId);
            if (foundTask) {
                taskToFind = foundTask;
                break;
            }
        }
        if (taskToFind) break;
    }

    if (!taskToFind) return;

    setIsContentModalOpen(true);
    setIsContentLoading(true);
    setContentError(null);
    setEducationalContent(null);
    setContentRequestTaskId(taskId);

    try {
        const content = await searchEducationalContent(taskToFind.title);
        setEducationalContent(content);
    } catch (err) {
        setContentError("Eğitim içeriği alınırken bir hata oluştu.");
    } finally {
        setIsContentLoading(false);
    }
  };

  const handleRetryContent = () => {
    if(contentRequestTaskId) {
        handleFindContentClick(contentRequestTaskId);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tekrar hoş geldin, {currentUser.displayName}!</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Bugün hedeflerin için ilerleme kaydedelim.</p>
        </div>
        
        <TodaysFocus focusItems={focusItems} dailyFocusId={currentUser.dailyFocusTaskId} />

        <GlobalDailyPlanner sprintsWithProjects={allActiveSprints} onTaskClick={handleTaskClick} />

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Rozetlerin</h2>
            <div className="flex flex-wrap gap-4">
                {userBadges.map(badge => <BadgeComponent key={badge.id} badge={badge} />)}
                 <div className="flex items-center justify-center w-36 h-36 flex-col text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 dark:text-gray-500">
                  <span className="text-3xl">💡</span>
                  <span className="text-sm font-medium mt-2">Yakında daha fazla rozet gelecek!</span>
              </div>
            </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projelerin</h2>
             <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
              >
                  <PlusIcon className="w-5 h-5" />
                  <span>Yeni Proje</span>
              </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
      <NewProjectModal 
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onAddProject={handleAddProject}
        isCreating={isCreatingProject}
      />
       {selectedTaskInfo && (
        <TaskDetailModal
          isOpen={!!selectedTaskInfo}
          onClose={() => setSelectedTaskInfo(null)}
          taskId={selectedTaskInfo.taskId}
          sprintId={selectedTaskInfo.sprintId}
          projectId={selectedTaskInfo.projectId}
          onFindContent={handleFindContentClick}
        />
      )}
      <EducationalContentModal 
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        isLoading={isContentLoading}
        error={contentError}
        content={educationalContent}
        onRetry={handleRetryContent}
      />
    </>
  );
};

export default Dashboard;