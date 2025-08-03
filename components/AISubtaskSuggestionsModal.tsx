import React, { useState, useEffect } from 'react';
import XIcon from './icons/XIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';

interface AISubtaskSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onAddSubtasks: (titles: string[]) => void;
}

const AISubtaskSuggestionsModal: React.FC<AISubtaskSuggestionsModalProps> = ({ isOpen, onClose, suggestions, onAddSubtasks }) => {
  const [selectedSubtasks, setSelectedSubtasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSelectedSubtasks(new Set());
    }
  }, [isOpen]);

  const handleToggleSubtask = (title: string) => {
    const newSelection = new Set(selectedSubtasks);
    if (newSelection.has(title)) {
      newSelection.delete(title);
    } else {
      newSelection.add(title);
    }
    setSelectedSubtasks(newSelection);
  };

  const handleAddSelected = () => {
    onAddSubtasks(Array.from(selectedSubtasks));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <SparklesIcon className="w-6 h-6 text-purple-500"/>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Alt Görev Önerileri</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto">
            {suggestions.length > 0 ? (
                suggestions.map((title, index) => (
                    <div 
                        key={`${title}-${index}`} 
                        onClick={() => handleToggleSubtask(title)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${selectedSubtasks.has(title) ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <input
                            type="checkbox"
                            checked={selectedSubtasks.has(title)}
                            onChange={() => handleToggleSubtask(title)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="ml-4 flex-grow">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Bu görev için şu anda mevcut bir öneri yok.</p>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                İptal
            </button>
            <button 
                onClick={handleAddSelected} 
                disabled={selectedSubtasks.size === 0} 
                className="flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              <ClipboardCheckIcon className="w-5 h-5"/>
              <span>Seçilenleri Ekle ({selectedSubtasks.size})</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AISubtaskSuggestionsModal;