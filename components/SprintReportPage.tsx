import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { SprintReport, Project, Sprint } from '../types';
import { generateSprintReport } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import TrendingDownIcon from './icons/TrendingDownIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const SprintReportPage: React.FC = () => {
    const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
    const { getProjectById } = useProjectData();
    const { currentUser } = useAuth();
    const [report, setReport] = useState<SprintReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const project = projectId ? getProjectById(projectId) : undefined;
    const sprint = project?.sprints.find(s => s.id === sprintId);

    const fetchReport = useCallback(async () => {
        if (project && sprint && currentUser) {
            try {
                setIsLoading(true);
                setError(null);
                const generatedReport = await generateSprintReport(project, sprint, currentUser.settings.aiCoachName);
                setReport(generatedReport);
            } catch (err) {
                setError('Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    }, [project, sprint, currentUser]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);
    
    if (!project || !sprint) {
        return <div className="p-6 text-red-500">Proje veya sprint bulunamadı.</div>;
    }
    
    const ReportSection: React.FC<{
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
        className?: string;
    }> = ({ title, icon, children, className = 'bg-white dark:bg-gray-800' }) => (
        <div className={`${className} p-6 rounded-xl shadow-sm`}>
            <div className="flex items-center mb-4">
                {icon}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 ml-3">{title}</h2>
            </div>
            {children}
        </div>
    );
    
    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-md w-1/2"></div>
                </div>
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="flex items-center mb-4">
                        <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-700"></div>
                        <div className="h-6 w-1/4 bg-purple-200 dark:bg-purple-700 rounded-md ml-3"></div>
                    </div>
                    <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded-md"></div>
                    <div className="h-4 w-5/6 bg-purple-200 dark:bg-purple-700 rounded-md mt-2"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center mb-4">
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-600 rounded-md ml-3"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-5xl mx-auto">
                <AlertTriangleIcon className="w-12 h-12 text-red-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Rapor Oluşturulamadı</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                <button
                    onClick={fetchReport}
                    className="mt-6 flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600"
                >
                    <span>Tekrar Dene</span>
                </button>
            </div>
        );
    }

    if (!report) {
        return <div className="p-6 text-center text-gray-500">Rapor verisi bulunamadı.</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <Link to={`/project/${projectId}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">&larr; Projeye Geri Dön</Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Sprint {sprint.sprintNumber} Analiz Raporu</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">"{project.title}" projesi için AI tarafından oluşturulan analiz.</p>
            </div>

            <ReportSection title="AI Genel Değerlendirme" icon={<SparklesIcon className="w-6 h-6 text-purple-500" />} className="bg-purple-50 dark:bg-purple-900/20">
                <p className="text-purple-800 dark:text-purple-200 italic">{report.summary}</p>
            </ReportSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportSection title="Öne Çıkan Başarılar" icon={<TrendingUpIcon className="w-6 h-6 text-green-500" />}>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {report.achievements.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </ReportSection>

                <ReportSection title="Karşılaşılan Zorluklar" icon={<TrendingDownIcon className="w-6 h-6 text-red-500" />}>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {report.challenges.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </ReportSection>
                
                <ReportSection title="AI Tavsiyeleri" icon={<LightbulbIcon className="w-6 h-6 text-yellow-500" />}>
                    <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {report.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </ReportSection>

                <ReportSection title="Kazanılan Beceriler" icon={<BrainCircuitIcon className="w-6 h-6 text-blue-500" />}>
                    <div className="flex flex-wrap gap-2">
                        {report.acquiredSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50 rounded-full">
                                {skill}
                            </span>
                        ))}
                    </div>
                </ReportSection>
            </div>
        </div>
    );
};

export default SprintReportPage;