import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { Task, TaskStatus, Sprint, AITaskSuggestion, EducationalContent } from '../types';
import TaskCard from './TaskCard';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import FlagIcon from './icons/FlagIcon';
import CheckIcon from './icons/CheckIcon';
import { getAITaskSuggestions, searchEducationalContent } from '../services/geminiService';
import TaskDetailModal from './TaskDetailModal';
import NewTaskModal from './NewTaskModal';
import AISuggestionsModal from './AISuggestionsModal';
import SprintReviewModal from './SprintReviewModal';
import { formatDate, getDateDifference } from '../utils/date';
import TeamManagementModal from './TeamManagementModal';
import AnalyticsIcon from './icons/AnalyticsIcon';
import SprintDailyPlanner from './SprintDailyPlanner';
import EducationalContentModal from './EducationalContentModal';

const KanbanColumn: React.FC<{
  title: TaskStatus;
  tasks: Task[];
  onDrop: (taskId: string, status: TaskStatus) => void;
  onTaskClick: (taskId: string) => void;
  renderTask: (task: Task) => React.ReactNode;
}> = ({ title, tasks, onDrop, onTaskClick, renderTask }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, title);
  };
  const statusColors: { [key in TaskStatus]: string } = {
    [TaskStatus.Backlog]: 'border-gray-500',
    [TaskStatus.Todo]: 'border-blue-500',
    [TaskStatus.InProgress]: 'border-yellow-500',
    [TaskStatus.Review]: 'border-purple-500',
    [TaskStatus.Done]: 'border-green-500',
  };
  return (
    <div onDragOver={handleDragOver} onDrop={handleDrop} className="flex-1 min-w-[300px] bg-gray-100 dark:bg-gray-800/50 rounded-xl">
      <div className={`p-4 border-t-4 ${statusColors[title]} rounded-t-xl`}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title} ({tasks.length})</h3>
      </div>
      <div className="p-2 space-y-3 h-full">
        {tasks.map(renderTask)}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProjectById, updateTaskStatus, addTaskToProject, addSuggestedTasksToSprints, completeSprint, completeProject, breakDownAndSuggestContentForTask } = useProjectData();
  const { getUserById, currentUser } = useAuth();
  
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAISuggestionsModalOpen, setIsAISuggestionsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<AITaskSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'future'>('active');

  // State for Educational Content Modal
  const [educationalContent, setEducationalContent] = useState<EducationalContent | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentRequestTaskId, setContentRequestTaskId] = useState<string | null>(null);


  if (!projectId) return <div>Proje bulunamadı.</div>;
  const project = getProjectById(projectId);
  if (!project || !currentUser) return <div>{projectId} ID'li proje bulunamadı veya kullanıcı bilgileri eksik.</div>;

  const activeSprint = project.sprints.find(s => s.status === 'active');
  const completedSprints = project.sprints.filter(s => s.status === 'completed').sort((a,b) => b.sprintNumber - a.sprintNumber);
  const futureSprints = project.sprints.filter(s => s.status === 'planning').sort((a,b) => a.sprintNumber - b.sprintNumber);

  const dateDiff = getDateDifference(project.estimatedCompletionDate, project.targetCompletionDate);
  const dateStatusText = dateDiff > 0 ? `(+${dateDiff} gün)` : dateDiff < 0 ? `(${-dateDiff} gün)` : '(Zamanında)';
  const dateColorClass = dateDiff > 0 ? 'text-red-500' : dateDiff < 0 ? 'text-green-500' : 'text-gray-500';
  
  const isLastSprint = activeSprint ? activeSprint.sprintNumber === project.totalSprints : false;
  const teamMembers = project.teamMembers?.map(tm => getUserById(tm.userId)).filter(Boolean) || [];


  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    if (activeSprint) {
      updateTaskStatus(project.id, activeSprint.id, taskId, newStatus);
    }
  };
  
  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    try {
        const suggestions = await getAITaskSuggestions(project.title, project.description, project.totalSprints, currentUser.settings.aiCoachName);
        setSuggestedTasks(suggestions);
        setIsAISuggestionsModalOpen(true);
    } catch (error) { console.error("AI önerileri alınamadı:", error); } 
    finally { setIsSuggesting(false); }
  };
  
  const handleAddTask = (sprintId: string, taskData: Omit<Task, 'id' | 'subtasks' | 'aiComments' | 'notes' | 'createdBy' | 'statusHistory' | 'isAiAssisted' | 'status' | 'assigneeId' | 'plannedDate'>) => {
    addTaskToProject(projectId, sprintId, taskData, false);
    setIsNewTaskModalOpen(false);
  };

  const handleAddSuggestedTasks = (tasksToAdd: AITaskSuggestion[]) => {
      addSuggestedTasksToSprints(projectId, tasksToAdd);
      setIsAISuggestionsModalOpen(false);
      setSuggestedTasks([]);
  };
  
  const handleCompleteSprint = (retrospective: { good: string; improve: string; }) => {
    if(activeSprint) {
        completeSprint(projectId, activeSprint.id, retrospective);
        setIsReviewModalOpen(false);
    }
  }

  const handleTaskClick = (taskId: string, sprintId: string) => {
    setSelectedTaskId(taskId);
    setSelectedSprintId(sprintId);
  }
  const handleCloseModal = () => {
    setSelectedTaskId(null);
    setSelectedSprintId(null);
  };

  const openContentModal = async (taskId: string, handler: (title: string) => Promise<EducationalContent | null>) => {
    const task = activeSprint?.tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsContentModalOpen(true);
    setIsContentLoading(true);
    setContentError(null);
    setEducationalContent(null);
    setContentRequestTaskId(taskId); // To retry if needed

    try {
        const content = await handler(task.title);
        setEducationalContent(content);
    } catch (err) {
        setContentError("Eğitim içeriği alınırken bir hata oluştu.");
    } finally {
        setIsContentLoading(false);
    }
  };

  const handleStaleTaskClick = (taskId: string) => {
      openContentModal(taskId, async () => breakDownAndSuggestContentForTask(projectId, activeSprint!.id, taskId));
  };
  
  const handleFindContentClick = (taskId: string) => {
      openContentModal(taskId, (title) => searchEducationalContent(title));
  };
  
  const handleRetryContent = () => {
    if(contentRequestTaskId) {
        // This assumes that the last action was the one to retry. 
        // A more robust system would store the handler type too.
        handleFindContentClick(contentRequestTaskId);
    }
  }

  const columns: TaskStatus[] = [TaskStatus.Backlog, TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Review, TaskStatus.Done];

  const TabButton: React.FC<{tabName: 'active' | 'history' | 'future', label: string}> = ({tabName, label}) => (
      <button 
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === tabName ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
      >
        {label}
      </button>
  );
  
  const SprintHeader: React.FC<{sprint: Sprint; duration: number}> = ({sprint, duration}) => (
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
            Sprint {sprint.sprintNumber}: {sprint.goal} 
            <span className="text-sm font-normal text-gray-500 ml-2">({duration} Hafta, {formatDate(sprint.startDate || '')} - {formatDate(sprint.endDate || '')})</span>
        </h3>
        {sprint.status === 'completed' && (
            <Link to={`/project/${project.id}/report/${sprint.id}`} className="flex items-center space-x-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors duration-200">
                <AnalyticsIcon className="w-4 h-4"/>
                <span>Raporu Görüntüle</span>
            </Link>
        )}
      </div>
  );
  
  const renderTask = (task: Task) => {
    const isStale = (() => {
      if (!activeSprint || task.status === TaskStatus.Done || activeTab !== 'active') return false;
      
      const staleThresholdDays = project.sprintDurationWeeks === 1 ? 5 : 11;
      const lastUpdateTimestamp = task.statusHistory.length > 0
        ? task.statusHistory[task.statusHistory.length - 1].timestamp
        : activeSprint.startDate;
      
      if (!lastUpdateTimestamp) return false;

      const daysSinceUpdate = (new Date().getTime() - new Date(lastUpdateTimestamp).getTime()) / (1000 * 3600 * 24);
      return daysSinceUpdate > staleThresholdDays;
    })();

    return (
      <TaskCard 
        key={task.id} 
        task={task} 
        onClick={() => handleTaskClick(task.id, activeSprint ? activeSprint.id : completedSprints.find(s=>s.tasks.some(t=>t.id===task.id))!.id)} 
        isStale={isStale}
        onStaleClick={() => handleStaleTaskClick(task.id)}
      />
    );
  };


  return (
    <>
      <div>
          <div className="mb-6">
              <div className="flex justify-between items-start">
                  <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                      <div className="flex items-center space-x-2 mt-2">
                        <p className="text-gray-600 dark:text-gray-400">
                            {activeSprint ? `Aktif Sprint: ${activeSprint.sprintNumber} (${project.sprintDurationWeeks} Hafta)` : "Aktif sprint yok."}
                        </p>
                        {teamMembers.length > 0 && (
                            <div onClick={() => setIsTeamModalOpen(true)} className="flex -space-x-2 items-center border-l pl-2 ml-2 border-gray-300 dark:border-gray-600 cursor-pointer group">
                                {teamMembers.map(member => member && (
                                    <img key={member.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 group-hover:scale-110 transition-transform" src={`https://picsum.photos/seed/${member.id}/40/40`} alt={member.displayName} title={member.displayName}/>
                                ))}
                                {project.teamMembers.length < 10 && 
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                  </div>
                                }
                            </div>
                        )}
                      </div>
                  </div>
                   <div className="flex items-center space-x-2">
                   {isLastSprint && activeSprint ? (
                     <button
                       onClick={() => completeProject(projectId)}
                       className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200"
                     >
                       <CheckIcon className="w-5 h-5"/>
                       <span>Projeyi Tamamla</span>
                     </button>
                   ) : (
                     <button
                       onClick={() => setIsReviewModalOpen(true)}
                       disabled={!activeSprint || activeSprint.tasks.length === 0}
                       className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 disabled:bg-yellow-300 disabled:cursor-not-allowed"
                     >
                       <FlagIcon className="w-5 h-5"/>
                       <span>Sprint'i Tamamla</span>
                     </button>
                   )}
                   <button onClick={handleGetSuggestions} disabled={isSuggesting} className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed">
                      <SparklesIcon className="w-5 h-5"/>
                      <span>{isSuggesting ? 'Düşünülüyor...' : 'AI Önerileri'}</span>
                   </button>
                   <button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200">
                      <PlusIcon className="w-5 h-5"/>
                      <span>Yeni Görev</span>
                   </button>
              </div>
              </div>
              
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-between text-sm shadow-sm">
                  <div><span className="font-semibold text-gray-700 dark:text-gray-200">İlerleme: </span><span className="font-bold text-primary-600 dark:text-primary-400">Sprint {activeSprint?.sprintNumber || 'N/A'} / {project.totalSprints}</span></div>
                   <div><span className="font-semibold text-gray-700 dark:text-gray-200">Hedef Tarih: </span><span className="font-bold text-gray-800 dark:text-gray-100">{formatDate(project.targetCompletionDate)}</span></div>
                   <div><span className="font-semibold text-gray-700 dark:text-gray-200">Tahmini Bitiş: </span><span className={`font-bold ${dateColorClass}`}>{formatDate(project.estimatedCompletionDate)} {dateStatusText}</span></div>
              </div>
          </div>
          
          <div className="mb-4 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
              <TabButton tabName="active" label="Aktif Sprint" />
              <TabButton tabName="history" label="Geçmiş" />
              <TabButton tabName="future" label="Gelecek" />
          </div>

          {activeTab === 'active' && (
            activeSprint ? (
                <>
                <div className="mb-2">
                    <SprintHeader sprint={activeSprint} duration={project.sprintDurationWeeks} />
                </div>
                
                <div className="mb-6">
                   <SprintDailyPlanner 
                        sprint={activeSprint} 
                        projectId={projectId} 
                        onTaskClick={(taskId) => handleTaskClick(taskId, activeSprint.id)} 
                    />
                </div>

                <div className="flex space-x-4 overflow-x-auto pb-4">
                {columns.map(status => (
                    <KanbanColumn key={status} title={status} tasks={activeSprint.tasks.filter(t => t.status === status)} onDrop={handleDrop} onTaskClick={(taskId) => handleTaskClick(taskId, activeSprint.id)} renderTask={renderTask} />
                ))}
                </div>
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-xl"><h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Aktif sprint yok.</h2><p className="text-gray-500 dark:text-gray-400 mt-2">Gelecek sprint'lerden birini başlatın veya yeni bir görev ekleyin.</p></div>
            )
          )}
          
          {activeTab === 'history' && (
              <div className="space-y-4">
                  {completedSprints.map(sprint => (
                      <div key={sprint.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <SprintHeader sprint={sprint} duration={project.sprintDurationWeeks} />
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {sprint.tasks.map(task => <div key={task.id} onClick={() => handleTaskClick(task.id, sprint.id)} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"><p className="font-semibold">{task.title}</p><p className="text-xs text-gray-500">Tamamlandı: {formatDate(task.completedAt || '')}</p></div>)}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'future' && (
              <div className="space-y-4">
                  {futureSprints.map(sprint => (
                       <div key={sprint.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <SprintHeader sprint={sprint} duration={project.sprintDurationWeeks} />
                           {sprint.tasks.length > 0 ? (
                               <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sprint.tasks.map(task => <div key={task.id} onClick={() => handleTaskClick(task.id, sprint.id)} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"><p className="font-semibold">{task.title}</p></div>)}
                               </div>
                           ) : (
                               <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Bu sprint için henüz görev eklenmedi.</p>
                           )}
                      </div>
                  ))}
              </div>
          )}
      </div>

      {selectedSprintId && <TaskDetailModal isOpen={!!selectedTaskId} onClose={handleCloseModal} taskId={selectedTaskId} projectId={project.id} sprintId={selectedSprintId} onFindContent={handleFindContentClick} />}
      {activeSprint && <SprintReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={project} activeSprint={activeSprint} onComplete={handleCompleteSprint} />}
      {isNewTaskModalOpen && <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} onAddTask={handleAddTask} projectId={projectId} activeSprintId={activeSprint?.id} />}
      <AISuggestionsModal isOpen={isAISuggestionsModalOpen} onClose={() => setIsAISuggestionsModalOpen(false)} suggestions={suggestedTasks} onAddTasks={handleAddSuggestedTasks}/>
      <TeamManagementModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} project={project}/>
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

export default KanbanBoard;