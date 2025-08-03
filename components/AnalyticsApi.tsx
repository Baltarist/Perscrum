import React, { useState, useEffect, useMemo } from 'react';
import { useProjectApi } from '../hooks/useProjectApi';
import { useAuthApi } from '../hooks/useAuthApi';
import TrendingUpIcon from './icons/TrendingUpIcon';
import TrendingDownIcon from './icons/TrendingDownIcon';
import LockIcon from './icons/LockIcon';

const AnalyticsApi: React.FC = () => {
  const { projects, loadProjects, isLoading } = useProjectApi();
  const { currentUser } = useAuthApi();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load projects if not loaded
  useEffect(() => {
    if (projects.length === 0) {
      loadProjects();
    }
  }, [projects.length, loadProjects]);

  const isFreeTier = currentUser?.subscriptionTier === 'free';
  
  const activeProjects = projects.filter(p => p.status === 'active' && p.sprints?.some(s => s.status === 'active'));

  useEffect(() => {
    if (activeProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(activeProjects[0].id);
    }
  }, [activeProjects, selectedProjectId]);
  
  const completedSprintsWithProjects = useMemo(() => {
    return projects.flatMap(project => 
      (project.sprints || [])
        .filter(sprint => sprint.status === 'completed')
        .map(sprint => ({ project, sprint }))
    ).sort((a, b) => new Date(b.sprint.endDate || 0).getTime() - new Date(a.sprint.endDate || 0).getTime());
  }, [projects]);
  
  // Calculate basic stats from available data
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    
    projects.forEach(project => {
      (project.sprints || []).forEach(sprint => {
        (sprint.tasks || []).forEach(task => {
          totalTasks++;
          totalStoryPoints += task.storyPoints || 0;
          if (task.status === 'done') {
            completedTasks++;
            completedStoryPoints += task.storyPoints || 0;
          }
        });
      });
    });

    return {
      totalTasks,
      completedTasks,
      totalStoryPoints,
      completedStoryPoints,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      avgVelocity: completedSprintsWithProjects.length > 0 ? 
        Math.round(completedStoryPoints / completedSprintsWithProjects.length) : 0
    };
  }, [projects, completedSprintsWithProjects]);

  const LockedFeature: React.FC<{title: string}> = ({title}) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center">
      <LockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Bu özellik Pro paketinde mevcuttur</p>
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Pro'ya Yükselt
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div>Analytics yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        {isFreeTier && (
          <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
            <LockIcon className="w-4 h-4 mr-1" />
            Gelişmiş analytics Pro pakette
          </div>
        )}
      </div>

      {/* Basic Stats - Always Available */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Toplam Görev</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tamamlanan</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tamamlanma Oranı</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Ortalama Velocity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgVelocity}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <TrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      {activeProjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Proje Seçimi</h2>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {activeProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Advanced Features - Pro Only */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isFreeTier ? (
          <>
            <LockedFeature title="Velocity Trendi" />
            <LockedFeature title="Burndown Grafiği" />
            <LockedFeature title="Detaylı Sprint Raporları" />
            <LockedFeature title="AI Destekli İçgörüler" />
          </>
        ) : (
          <>
            {/* These would be actual charts and analytics for Pro users */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Velocity Trendi</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Velocity grafiği burada görünecek
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Burndown Grafiği</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Burndown grafiği burada görünecek
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Sprint Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Son Sprint Performansları</h2>
        {completedSprintsWithProjects.length > 0 ? (
          <div className="space-y-3">
            {completedSprintsWithProjects.slice(0, 5).map(({ project, sprint }) => (
              <div key={sprint.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{project.title} - Sprint {sprint.sprintNumber}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{sprint.goal}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 dark:text-green-400">✓ Tamamlandı</div>
                  <div className="text-xs text-gray-500">
                    {new Date(sprint.endDate || '').toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Henüz tamamlanmış sprint bulunmuyor
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsApi;