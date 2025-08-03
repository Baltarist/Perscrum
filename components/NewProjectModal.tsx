import React, { useState, useRef } from 'react';
import { Project } from '../types';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import { getColorClass } from '../utils/colors';
import { Part } from '@google/genai';

type NewProjectData = Omit<Project, 'id' | 'sprints' | 'status' | 'estimatedCompletionDate' | 'totalSprints' | 'sprintDurationWeeks' | 'teamMembers'> & { weeklyHourCommitment: number; filePart?: Part };

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: NewProjectData) => void;
  isCreating: boolean;
}

const colorOptions = ['blue', 'green', 'purple', 'red', 'yellow', 'indigo'];

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onAddProject, isCreating }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState('blue');
  const [targetDate, setTargetDate] = useState('');
  const [totalSprints, setTotalSprints] = useState(5);
  const [sprintDurationWeeks, setSprintDurationWeeks] = useState<1 | 2>(2);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate || isCreating) return;
    
    // TODO: AI integration will be added in Phase 3
    // let filePart: Part | undefined;
    // if (file) {
    //   filePart = await fileToGenerativePart(file);
    // }
    
    onAddProject({ 
      title, 
      description, 
      colorTheme, 
      targetCompletionDate: targetDate, 
      totalSprints,
      sprintDurationWeeks,
      weeklyHourCommitment: weeklyHours
      // filePart  // Will be added in Phase 3 AI integration
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Proje Oluştur</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proje Başlığı</label>
            <input
              type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Örn: Yeni bir dil öğren" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Proje hedefleriniz... AI bu bilgiyi görev önermek için kullanacak." />
          </div>
          
          {/* AI File Upload - Temporarily disabled until Phase 3 */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosya Ekle (İsteğe bağlı)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {filePreview ? (
                    <img src={filePreview} alt="Dosya Önizlemesi" className="mx-auto h-24 w-auto object-contain"/>
                ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Bir dosya yükle</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} ref={fileInputRef} accept="image/*,application/pdf,.txt,.md"/>
                  </label>
                  <p className="pl-1">veya sürükleyip bırak</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF, TXT, MD</p>
              </div>
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef Bitiş Tarihi</label>
              <input type="date" id="target-date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
            </div>
            <div>
              <label htmlFor="total-sprints" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toplam Sprint Sayısı</label>
              <input type="number" id="total-sprints" value={totalSprints} onChange={(e) => setTotalSprints(parseInt(e.target.value, 10))} min="1" max="50"
                className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sprint-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sprint Süresi</label>
              <select id="sprint-duration" value={sprintDurationWeeks} onChange={(e) => setSprintDurationWeeks(parseInt(e.target.value) as 1 | 2)}
                className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" required>
                <option value={1}>1 Hafta</option>
                <option value={2}>2 Hafta</option>
              </select>
            </div>
            <div>
              <label htmlFor="weekly-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Haftalık Saat Taahhüdü</label>
              <input type="number" id="weekly-hours" value={weeklyHours} onChange={(e) => setWeeklyHours(parseInt(e.target.value, 10))} min="1" max="40"
                className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Renk Teması</label>
            <div className="mt-2 flex space-x-2">
              {colorOptions.map(color => (
                <button key={color} type="button" onClick={() => setColorTheme(color)}
                  className={`w-8 h-8 rounded-full ${getColorClass(color, 'bg')} transition-transform hover:scale-110 ${colorTheme === color ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800' : ''}`}
                  aria-label={`Select ${color} theme`} />
              ))}
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">İptal</button>
            <button type="submit" disabled={!title.trim() || !targetDate || isCreating} className="flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-wait">
              <PlusIcon className={`w-5 h-5 ${isCreating ? 'animate-spin' : ''}`}/>
              <span>{isCreating ? 'Proje Planlanıyor...' : 'Proje Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;