import React from 'react';
import { EducationalContent } from '../types';
import XIcon from './icons/XIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LinkIcon from './icons/LinkIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface EducationalContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  content: EducationalContent | null;
  onRetry: () => void;
}

const EducationalContentModal: React.FC<EducationalContentModalProps> = ({ isOpen, onClose, isLoading, error, content, onRetry }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mt-6"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-10">
                <AlertTriangleIcon className="w-12 h-12 text-red-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">İçerik Yüklenemedi</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                <button
                    onClick={onRetry}
                    className="mt-6 flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600"
                >
                    <span>Tekrar Dene</span>
                </button>
            </div>
        );
    }
    
    if (!content) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-10">Bu konu için eğitim içeriği bulunamadı.</p>;
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">AI Tarafından Oluşturulan Özet Makale</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{content.summaryArticle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Ücretli Kurslar</h3>
                 <div className="space-y-2">
                    {content.paidCourses.map((course, index) => (
                        <a href={course.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LinkIcon className="w-4 h-4 text-primary-500 flex-shrink-0"/>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{course.title}</span>
                        </a>
                    ))}
                 </div>
            </div>
             <div>
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Ücretsiz Videolar</h3>
                 <div className="space-y-2">
                    {content.freeVideos.map((video, index) => (
                        <a href={video.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LinkIcon className="w-4 h-4 text-primary-500 flex-shrink-0"/>
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{video.title}</span>
                        </a>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <BookOpenIcon className="w-6 h-6 text-blue-500"/>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Destekli Eğitim İçeriği</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EducationalContentModal;