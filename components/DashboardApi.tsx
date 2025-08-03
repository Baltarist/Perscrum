import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthApi } from '../hooks/useAuthApi';
import { useProjectApi } from '../hooks/useProjectApi';
import ProjectCard from './ProjectCard';
import TodaysFocus from './TodaysFocus';
import NewProjectModal from './NewProjectModal';
import DailyCheckinModal from './DailyCheckinModal';
import NewBadgeModal from './NewBadgeModal';
import PlusIcon from './icons/PlusIcon';
import DashboardIcon from './icons/DashboardIcon';
import TrophyIcon from './icons/TrophyIcon';
import TargetIcon from './icons/TargetIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import SparklesIcon from './icons/SparklesIcon';

const DashboardApi: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, recordDailyCheckin } = useAuthApi();
  const { projects, loadProjects, createProject, isLoading, error } = useProjectApi();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState<any>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeSprints: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Load projects on component mount
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    // Calculate dashboard stats from projects
    if (projects.length > 0) {
      let totalTasks = 0;
      let completedTasks = 0;
      let activeSprints = 0;

      projects.forEach(project => {
        if (project.sprints) {
          project.sprints.forEach(sprint => {
            if (sprint.status === 'active') {
              activeSprints++;
            }
            if (sprint.tasks) {
              totalTasks += sprint.tasks.length;
              completedTasks += sprint.tasks.filter(task => task.status === 'done').length;
            }
          });
        }
      });

      setStats({
        totalTasks,
        completedTasks,
        activeSprints,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      });
    }
  }, [projects]);

  const handleNewProject = async (projectData: any) => {
    console.log('🚀 FRONTEND: Creating project with data:', projectData);
    
    const apiData = {
      title: projectData.title,
      description: projectData.description,
      targetCompletionDate: projectData.targetCompletionDate,
      totalSprints: projectData.totalSprints,
      sprintDurationWeeks: projectData.sprintDurationWeeks,
      colorTheme: projectData.colorTheme
    };
    
    console.log('🚀 FRONTEND: Sending to API:', apiData);
    
    const success = await createProject(apiData);

    if (success) {
      setShowNewProjectModal(false);
    }
  };

  const handleDailyCheckin = async (checkinData: any) => {
    const success = await recordDailyCheckin({
      mood: checkinData.mood,
      productivity: checkinData.productivity,
      notes: checkinData.notes
    });

    if (success) {
      setShowCheckinModal(false);
      // Check if a badge was earned
      // This would come from the API response
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <DashboardIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hoşgeldin, {currentUser.displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bugün hedeflerine bir adım daha yaklaş
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCheckinModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Günlük Check-in
          </button>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Yeni Proje
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Projeler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
            </div>
            <TargetIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Sprint'ler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSprints}</p>
            </div>
            <SparklesIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan Görevler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanma Oranı</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
            </div>
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      <TodaysFocus />

      {/* Projects Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projelerim</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} proje
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TargetIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz proje yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              İlk projenizi oluşturarak başlayın
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              İlk Projeni Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onAddProject={handleNewProject}
          isCreating={isLoading}
        />
      )}

      {showCheckinModal && (
        <DailyCheckinModal
          isOpen={showCheckinModal}
          onClose={() => setShowCheckinModal(false)}
          onSubmit={handleDailyCheckin}
        />
      )}

      {showBadgeModal && newBadge && (
        <NewBadgeModal
          badge={newBadge}
          onClose={() => {
            setShowBadgeModal(false);
            setNewBadge(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardApi;