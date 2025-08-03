import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectApi } from '../hooks/useProjectApi';
import { useAuthApi } from '../hooks/useAuthApi';
import { Task, TaskStatus, Sprint, Project } from '../types';
import { projectService } from '../services/projectService';
import TaskCard from './TaskCard';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import FlagIcon from './icons/FlagIcon';
import CheckIcon from './icons/CheckIcon';
import TaskDetailModal from './TaskDetailModal';
import NewTaskModal from './NewTaskModal';
import SprintReviewModal from './SprintReviewModal';
import { formatDate, getDateDifference } from '../utils/date';
import AnalyticsIcon from './icons/AnalyticsIcon';

const KanbanColumn: React.FC<{
  title: TaskStatus;
  tasks: Task[];
  onDrop: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (taskId: string) => void;
  renderTask: (task: Task) => React.ReactNode;
}> = ({ title, tasks, onDrop, onTaskClick, renderTask }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[500px]">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        {title}
        <span className="ml-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h3>
      <div
        className="space-y-3"
        onDrop={(e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData('text/plain');
          onDrop(taskId, title);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {tasks.map(renderTask)}
      </div>
    </div>
  );
};

const KanbanBoardApi: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    projects, 
    loadProjects, 
    getProjectById, 
    updateTaskStatus, 
    createTask, 
    completeSprint,
    isLoading,
    error 
  } = useProjectApi();
  const { currentUser } = useAuthApi();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'future'>('active');
  const [projectWithSprints, setProjectWithSprints] = useState<Project | null>(null);
  const [sprintsLoading, setSprintsLoading] = useState(false);

  // Load projects on mount if not loaded
  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
  }, [projects.length, loadProjects]);

  // Load sprints when project is available
  useEffect(() => {
    const loadProjectSprints = async () => {
      if (!projectId || !currentUser) return;
      
      const project = getProjectById(projectId);
      if (!project) return;

      setSprintsLoading(true);
      
      try {
        const response = await projectService.getProjectSprints(projectId);
        if (response.success && response.data?.sprints) {
          const projectWithSprintsData = {
            ...project,
            sprints: response.data.sprints
          };
          setProjectWithSprints(projectWithSprintsData);
        }
      } catch (error) {
        console.error('Error loading sprints:', error);
      } finally {
        setSprintsLoading(false);
      }
    };

    loadProjectSprints();
  }, [projectId, currentUser, getProjectById]);

  if (!projectId) return <div>Proje bulunamadı.</div>;
  
  const baseProject = getProjectById(projectId);
  if (!baseProject || !currentUser) {
    return (
      <div className="text-center py-8">
        {isLoading ? (
          <div>Proje yükleniyor...</div>
        ) : (
          <div>{projectId} ID'li proje bulunamadı veya kullanıcı bilgileri eksik.</div>
        )}
      </div>
    );
  }

  // Use project with sprints if available, otherwise base project
  const project = projectWithSprints || baseProject;
  
  if (sprintsLoading) {
    return (
      <div className="text-center py-8">
        <div>Sprint'ler yükleniyor...</div>
      </div>
    );
  }

  const activeSprint = project.sprints?.find(s => s.status === 'active');
  const completedSprints = project.sprints?.filter(s => s.status === 'completed').sort((a,b) => b.sprintNumber - a.sprintNumber) || [];
  const futureSprints = project.sprints?.filter(s => s.status === 'planning').sort((a,b) => a.sprintNumber - b.sprintNumber) || [];

  const dateDiff = getDateDifference(project.estimatedCompletionDate, new Date().toISOString());
  const dateStatusText = dateDiff > 0 ? `(+${dateDiff} gün)` : dateDiff < 0 ? `(${-dateDiff} gün)` : '(Zamanında)';
  const dateColorClass = dateDiff > 0 ? 'text-red-500' : dateDiff < 0 ? 'text-green-500' : 'text-gray-500';
  
  const isLastSprint = activeSprint ? activeSprint.sprintNumber === project.totalSprints : false;

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    if (activeSprint) {
      await updateTaskStatus(taskId, newStatus);
    }
  };
  
  const handleAddTask = async (sprintId: string, taskData: any) => {
    if (projectId) {
      const success = await createTask(projectId, sprintId, {
        title: taskData.title,
        description: taskData.description,
        storyPoints: taskData.storyPoints
      });
      if (success) {
        setIsNewTaskModalOpen(false);
        // Refresh projects to get updated tasks
        await loadProjects();
      }
    }
  };
  
  const handleCompleteSprint = async (retrospective: { good: string; improve: string; }) => {
    if (activeSprint && projectId) {
      const success = await completeSprint(projectId, activeSprint.id, retrospective);
      if (success) {
        setIsReviewModalOpen(false);
      }
    }
  };

  const handleTaskClick = (taskId: string, sprintId: string) => {
    setSelectedTaskId(taskId);
    setSelectedSprintId(sprintId);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setSelectedSprintId(null);
  };

  const columns: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

  const TabButton: React.FC<{tabName: 'active' | 'history' | 'future', label: string}> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tabName
          ? 'bg-primary-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const renderTask = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={() => handleTaskClick(task.id, activeSprint?.id || '')}
      className="cursor-pointer"
    >
      <TaskCard
        task={task}
        // For now, disable AI features
        onStaleClick={() => {}}
        onFindClick={() => {}}
      />
    </div>
  );

  const activeSprintTasks = activeSprint?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Hedef: {formatDate(project.targetCompletionDate)} {' '}
              <span className={dateColorClass}>{dateStatusText}</span>
            </span>
            <Link
              to={`/analytics`}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <AnalyticsIcon className="w-4 h-4 mr-1" />
              Analytics
            </Link>
          </div>
        </div>
        <div className="flex space-x-3">
          {activeSprint && (
            <>
              <button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Yeni Görev
              </button>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Sprint'i Tamamla
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sprint Tabs */}
      <div className="flex space-x-3">
        <TabButton tabName="active" label={`Aktif Sprint ${activeSprint ? `(${activeSprint.sprintNumber})` : ''}`} />
        <TabButton tabName="history" label={`Geçmiş (${completedSprints.length})`} />
        <TabButton tabName="future" label={`Gelecek (${futureSprints.length})`} />
      </div>

      {/* Content */}
      {activeTab === 'active' && activeSprint && (
        <div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-2">Sprint {activeSprint.sprintNumber}: {activeSprint.goal}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(activeSprint.startDate)} - {formatDate(activeSprint.endDate)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {columns.map(status => (
              <KanbanColumn
                key={status}
                title={status}
                tasks={activeSprintTasks.filter(task => task.status === status)}
                onDrop={handleDrop}
                onTaskClick={(taskId) => handleTaskClick(taskId, activeSprint.id)}
                renderTask={renderTask}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {completedSprints.map(sprint => (
            <div key={sprint.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold">Sprint {sprint.sprintNumber}: {sprint.goal}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </p>
              <div className="mt-2">
                <span className="text-sm text-green-600">✓ Tamamlandı</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'future' && (
        <div className="space-y-4">
          {futureSprints.map(sprint => (
            <div key={sprint.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold">Sprint {sprint.sprintNumber}: {sprint.goal}</h3>
              <div className="mt-2">
                <span className="text-sm text-blue-600">⏳ Planlanıyor</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isNewTaskModalOpen && activeSprint && (
        <NewTaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          onAddTask={(taskData) => handleAddTask(activeSprint.id, taskData)}
          activeSprintId={activeSprint.id}
        />
      )}

      {isReviewModalOpen && activeSprint && (
        <SprintReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          sprint={activeSprint}
          project={project}
          onComplete={handleCompleteSprint}
        />
      )}

      {selectedTaskId && selectedSprintId && (
        <TaskDetailModal
          isOpen={!!selectedTaskId}
          onClose={handleCloseModal}
          taskId={selectedTaskId}
          sprintId={selectedSprintId}
          projectId={projectId}
          // Disable AI content for now
          onFindContent={() => {}}
        />
      )}
    </div>
  );
};

export default KanbanBoardApi;