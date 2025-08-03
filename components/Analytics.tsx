import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { TaskStatus, Sprint, Project, OverallReport } from '../types';
import { Link } from 'react-router-dom';
import FileTextIcon from './icons/FileTextIcon';
import { formatDate } from '../utils/date';
import { generateOverallAnalysis } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import RocketIcon from './icons/RocketIcon';
import CrosshairIcon from './icons/CrosshairIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import LockIcon from './icons/LockIcon';

const Analytics: React.FC = () => {
    const { projects, velocityData, getBurndownChartData } = useProjectData();
    const { currentUser } = useAuth();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [overallReport, setOverallReport] = useState<OverallReport | null>(null);
    const [isGeneratingOverall, setIsGeneratingOverall] = useState(false);
    const [overallError, setOverallError] = useState<string | null>(null);

    const isFreeTier = currentUser?.subscriptionTier === 'free';
    
    const activeProjects = projects.filter(p => p.status === 'active' && p.sprints.some(s => s.status === 'active'));

    useEffect(() => {
        if (activeProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(activeProjects[0].id);
        }
    }, [activeProjects, selectedProjectId]);
    
    const completedSprintsWithProjects = useMemo(() => {
        return projects.flatMap(project => 
            project.sprints
                .filter(sprint => sprint.status === 'completed')
                .map(sprint => ({ project, sprint }))
        ).sort((a, b) => new Date(b.sprint.endDate || 0).getTime() - new Date(a.sprint.endDate || 0).getTime());
    }, [projects]);
    
    const handleGenerateOverallReport = async () => {
        setIsGeneratingOverall(true);
        setOverallError(null);
        setOverallReport(null);
        try {
            const report = await generateOverallAnalysis(projects);
            setOverallReport(report);
        } catch (err) {
            console.error("Genel rapor oluşturulurken hata:", err);
            setOverallError("Genel rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsGeneratingOverall(false);
        }
    };

    const burndownData = selectedProjectId ? getBurndownChartData(selectedProjectId) : [];
    
    const LockedFeature: React.FC<{title: string}> = ({title}) => (
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-full">
          <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
              <LockIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">Bu özellik Pro pakete özeldir</p>
              <button className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-bold hover:underline">Pro'ya Yükselt</button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 opacity-30">{title}</h2>
          <div className="opacity-30 h-[300px] w-full bg-gray-100 dark:bg-gray-700/50 rounded-md"></div>
      </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analiz Paneli</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">İlerlemeni gözden geçir, trendleri belirle ve genel performansın hakkında AI'dan geri bildirim al.</p>
            </div>
            
             {isFreeTier ? <LockedFeature title="Genel Analiz" /> : (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Genel Analiz</h2>
                         <button
                            onClick={handleGenerateOverallReport}
                            disabled={isGeneratingOverall}
                            className="flex items-center space-x-2 py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-wait"
                         >
                             <SparklesIcon className={`w-5 h-5 ${isGeneratingOverall ? 'animate-pulse' : ''}`}/>
                             <span>{isGeneratingOverall ? 'Analiz Ediliyor...' : 'Genel Rapor Oluştur'}</span>
                         </button>
                    </div>

                    {isGeneratingOverall && <p className="text-center text-gray-500">AI koçunuz tüm geçmişinizi analiz ediyor...</p>}
                    {overallError && <p className="text-center text-red-500">{overallError}</p>}
                    {overallReport && (
                        <div className="space-y-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg italic text-purple-800 dark:text-purple-200">
                               <p>"{overallReport.motivationalInsight}"</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="flex items-center text-md font-semibold text-gray-800 dark:text-gray-100 mb-2"><RocketIcon className="w-5 h-5 text-green-500 mr-2"/>Tekrarlayan Güçlü Yönler</h3>
                                    <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                        {overallReport.recurringStrengths.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h3 className="flex items-center text-md font-semibold text-gray-800 dark:text-gray-100 mb-2"><CrosshairIcon className="w-5 h-5 text-yellow-500 mr-2"/>Gelişim Fırsatları</h3>
                                    <ul className="space-y-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                        {overallReport.developmentOpportunities.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             )}
            
            {isFreeTier ? <LockedFeature title="Sprint Burn-down Grafiği" /> : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Sprint Burn-down Grafiği</h2>
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            {activeProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    {burndownData.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={burndownData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="day" stroke="rgb(107 114 128)" />
                                    <YAxis stroke="rgb(107 114 128)" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgb(55 65 81)', color: '#fff', borderRadius: '0.5rem' }}/>
                                    <Legend />
                                    <Line type="monotone" dataKey="remaining" name="Kalan Puan" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="ideal" name="İdeal Çizgi" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 h-[300px] flex items-center justify-center">Bu sprint için burn-down verisi mevcut değil.</p>
                    )}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Kişisel Hız Trendi</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={velocityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="sprint" stroke="rgb(107 114 128)" />
                            <YAxis stroke="rgb(107 114 128)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgb(55 65 81)', color: '#fff', borderRadius: '0.5rem' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="completedPoints" name="Tamamlanan Puanlar" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {isFreeTier ? <LockedFeature title="Sprint Raporları Arşivi" /> : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-4">
                        <FileTextIcon className="w-6 h-6 text-blue-500 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Sprint Raporları Arşivi</h2>
                    </div>
                    {completedSprintsWithProjects.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {completedSprintsWithProjects.map(({ project, sprint }) => (
                                <div key={sprint.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{project.title} - Sprint {sprint.sprintNumber}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(sprint.startDate || '')} - {formatDate(sprint.endDate || '')}</p>
                                    </div>
                                    <Link to={`/project/${project.id}/report/${sprint.id}`} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors duration-200">
                                        Raporu Görüntüle
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">Henüz tamamlanmış bir sprint raporu yok.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Analytics;