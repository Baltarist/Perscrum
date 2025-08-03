import React, { useState, useEffect } from 'react';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import XIcon from './icons/XIcon';
import FileTextIcon from './icons/FileTextIcon';
import PlusIcon from './icons/PlusIcon';
import SparklesIcon from './icons/SparklesIcon';
import { getAISubtaskSuggestions } from '../services/geminiService';
import AISubtaskSuggestionsModal from './AISubtaskSuggestionsModal';
import { formatDate } from '../utils/date';
import { TaskStatus, Sprint, StatusChange, User, TeamMember, Subtask } from '../types';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  projectId: string;
  sprintId: string;
  onFindContent: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId, projectId, sprintId, onFindContent }) => {
  const { getProjectById, updateTask, addTaskNote, toggleSubtask, addSubtask, addMultipleSubtasks, moveTaskToSprint, assignTask, assignSubtask, convertSubtasksToTasks } = useProjectData();
  const { getUserById } = useAuth();
  
  const project = getProjectById(projectId);
  const sprint = project?.sprints.find(s => s.id === sprintId);
  const task = sprint?.tasks.find(t => t.id === taskId);
  
  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const [isSuggestingSubtasks, setIsSuggestingSubtasks] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (task) {
      setEditableTitle(task.title);
      setEditableDescription(task.description || '');
      setNewNote('');
      setNewSubtaskTitle('');
      setSelectedSubtaskIds(new Set());
    }
  }, [task]);

  if (!isOpen || !task || !sprint || !project) return null;

  const teamMembers = project.teamMembers.map(tm => getUserById(tm.userId)).filter(Boolean) as User[];
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const creator = getUserById(task.createdBy);

  const handleTitleBlur = () => { if (editableTitle.trim() && editableTitle !== task.title) updateTask(projectId, sprintId, task.id, { title: editableTitle }); };
  const handleDescriptionBlur = () => { if (editableDescription !== (task.description || '')) updateTask(projectId, sprintId, task.id, { description: editableDescription }); };
  const handleAddNote = () => { if (newNote.trim()) { addTaskNote(projectId, sprintId, task.id, newNote); setNewNote(''); } };
  const handleToggleSubtask = (subtaskId: string) => toggleSubtask(projectId, sprintId, task.id, subtaskId);
  const handleAddSubtask = () => { if (newSubtaskTitle.trim()) { addSubtask(projectId, sprintId, task.id, newSubtaskTitle); setNewSubtaskTitle(''); } };
  const handleMoveTask = (newSprintId: string) => { if (newSprintId !== sprint.id) { moveTaskToSprint(projectId, task.id, sprint.id, newSprintId); onClose(); } };
  const handleAssignTask = (assigneeId: string) => assignTask(projectId, sprintId, task.id, assigneeId);
  const handleAssignSubtask = (subtaskId: string, assigneeId: string) => assignSubtask(projectId, sprintId, task.id, subtaskId, assigneeId);

  const handleGetSubtaskSuggestions = async () => {
    setIsSuggestingSubtasks(true);
    try {
        const suggestions = await getAISubtaskSuggestions(task.title, task.description);
        setSuggestedSubtasks(suggestions);
        setIsSubtaskModalOpen(true);
    } catch(error) { console.error("AI alt görev önerileri alınamadı:", error); } 
    finally { setIsSuggestingSubtasks(false); }
  };

  const handleAddSuggestedSubtasks = (titles: string[]) => {
      addMultipleSubtasks(projectId, sprintId, task.id, titles, true);
      setIsSubtaskModalOpen(false);
  };
  
  const handleSelectSubtask = (subtask: Subtask) => {
    if (subtask.isCompleted) return; // Don't allow selecting completed subtasks
    
    const newSelection = new Set(selectedSubtaskIds);
    if (newSelection.has(subtask.id)) {
        newSelection.delete(subtask.id);
    } else {
        newSelection.add(subtask.id);
    }
    setSelectedSubtaskIds(newSelection);
  };

  const handleConvertSubtasks = () => {
    if (selectedSubtaskIds.size > 0) {
        convertSubtasksToTasks(projectId, sprintId, task.id, Array.from(selectedSubtaskIds));
        setSelectedSubtaskIds(new Set()); // Clear selection after conversion
    }
  };


  const availableSprintsToMove = project.sprints.filter(s => s.status !== 'completed' && s.id !== sprintId);
  
  const ActivityItem: React.FC<{activity: StatusChange}> = ({activity}) => {
      const user = getUserById(activity.changedBy);
      return (
          <div className="flex items-center text-xs py-2 border-b border-gray-100 dark:border-gray-700/50">
             {user && <img className="w-6 h-6 rounded-full" src={`https://picsum.photos/seed/${user.id}/30/30`} alt={user.displayName} title={user.displayName}/>}
             <div className="ml-3 text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.displayName || 'Bilinmeyen'}</span> durumu 
                <span className="font-medium text-gray-500"> "{activity.from}"</span> konumundan 
                <span className="font-medium text-gray-800 dark:text-gray-200"> "{activity.to}"</span> konumuna değiştirdi.
             </div>
             <div className="ml-auto text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(activity.timestamp)}</div>
          </div>
      )
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
                <input type="text" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} onBlur={handleTitleBlur} className="text-xl font-bold text-gray-900 dark:text-white bg-transparent w-full focus:outline-none focus:ring-0 border-0 p-0"/>
                <div className="flex items-center mt-1 space-x-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sprint {sprint.sprintNumber} içinde</p>
                    {task.status === TaskStatus.Done && task.completedAt && <p className="text-xs text-green-600 dark:text-green-400">Tamamlandı: {formatDate(task.completedAt)}</p>}
                </div>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4"><XIcon className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</label>
                <textarea value={editableDescription} onChange={(e) => setEditableDescription(e.target.value)} onBlur={handleDescriptionBlur} rows={4} className="mt-1 w-full p-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="Daha ayrıntılı bir açıklama ekleyin..."/>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Alt Görevler</h3>
                    {selectedSubtaskIds.size > 0 && (
                        <button 
                            onClick={handleConvertSubtasks}
                            className="flex items-center space-x-1 text-sm bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-semibold py-1 px-2.5 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/60"
                        >
                            <ArrowUpRightIcon className="w-4 h-4"/>
                            <span>Seçilen {selectedSubtaskIds.size} alt görevi göreve dönüştür</span>
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                  {task.subtasks.map(subtask => {
                    const creator = getUserById(subtask.createdBy);
                    const isSelected = selectedSubtaskIds.has(subtask.id);
                    return (
                        <div 
                            key={subtask.id}
                            onClick={() => handleSelectSubtask(subtask)}
                            className={`flex items-center p-2 rounded-md transition-colors ${subtask.isCompleted ? 'opacity-50' : 'cursor-pointer'} ${isSelected ? 'bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-500' : 'bg-gray-100 dark:bg-gray-900/50'}`}
                        >
                            <input 
                                type="checkbox" 
                                id={`subtask-${subtask.id}`} 
                                checked={subtask.isCompleted} 
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleSubtask(subtask.id);
                                }} 
                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                disabled={subtask.isCompleted}
                            />
                            <label htmlFor={`subtask-${subtask.id}`} className={`ml-3 text-sm flex-grow ${subtask.isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'} ${subtask.isCompleted ? '' : 'cursor-pointer'}`}>{subtask.title}</label>
                            {creator && (
                                <div className="relative ml-2" title={`Oluşturan: ${creator.displayName}`}>
                                    <img className="w-5 h-5 rounded-full" src={`https://picsum.photos/seed/${creator.id}/30/30`} alt={creator.displayName}/>
                                    {subtask.isAiAssisted && <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-700 rounded-full p-px"><SparklesIcon className="w-2.5 h-2.5 text-purple-500" /></div>}
                                </div>
                            )}
                            <select value={subtask.assigneeId || ''} onChange={(e) => handleAssignSubtask(subtask.id, e.target.value)} onClick={e => e.stopPropagation()} className="ml-2 text-xs bg-transparent border-none focus:ring-0 p-0">
                                <option value="" disabled>Ata...</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.displayName}</option>)}
                            </select>
                        </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex space-x-2">
                    <input type="text" value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSubtask()} placeholder="Yeni bir alt görev ekle..." className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
                    <button onClick={handleAddSubtask} className="p-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600"><PlusIcon className="w-5 h-5"/></button>
                    <button onClick={handleGetSubtaskSuggestions} disabled={isSuggestingSubtasks} className="p-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 disabled:bg-purple-300" title="AI ile alt görev önerileri al"><SparklesIcon className={`w-5 h-5 ${isSuggestingSubtasks ? 'animate-pulse' : ''}`}/></button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sorumlular</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Oluşturan:</span>
                        {creator && <img className="w-6 h-6 rounded-full" src={`https://picsum.photos/seed/${creator.id}/30/30`} alt={creator.displayName}/>}
                        <span className="font-semibold">{creator?.displayName}</span>
                    </div>
                     <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm">Atanan:</span>
                        <select value={task.assigneeId || ''} onChange={e => handleAssignTask(e.target.value)} className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 font-semibold">
                            <option value="" disabled>Bir üyeye ata...</option>
                            {teamMembers.map(member => <option key={member.id} value={member.id}>{member.displayName}</option>)}
                        </select>
                        {assignee && <img className="w-6 h-6 rounded-full ml-auto" src={`https://picsum.photos/seed/${assignee.id}/30/30`} alt={assignee.displayName}/>}
                    </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Sprint'i Değiştir</label>
                  <select value={sprint.id} onChange={(e) => handleMoveTask(e.target.value)} className="mt-1 block w-full p-2 bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none" disabled={availableSprintsToMove.length === 0}>
                      <option value={sprint.id}>Sprint {sprint.sprintNumber}</option>
                      {availableSprintsToMove.map(s => <option key={s.id} value={s.id}>Sprint {s.sprintNumber}'e taşı</option>)}
                  </select>
                </div>
                <div>
                  <h3 className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2"><FileTextIcon className="w-4 h-4 mr-2"/> Notlar</h3>
                  <div className="space-y-2">
                    {task.notes && task.notes.map((note, index) => <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">{note}</div>)}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddNote()} placeholder="Yeni bir not ekle..." className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
                    <button onClick={handleAddNote} className="py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Ekle</button>
                  </div>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Aksiyonlar</h3>
                     <button
                        onClick={() => onFindContent(task.id)}
                        className="w-full flex items-center justify-center space-x-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold py-2 px-3 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60"
                    >
                        <BookOpenIcon className="w-4 h-4"/>
                        <span>Eğitim İçeriği Bul</span>
                    </button>
                </div>
                 <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Aktivite Geçmişi</h3>
                    <div className="space-y-1">
                        {task.statusHistory.length > 0 ? (
                            [...task.statusHistory].reverse().map(activity => <ActivityItem key={activity.timestamp} activity={activity} />)
                        ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Henüz bir aktivite yok.</p>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AISubtaskSuggestionsModal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} suggestions={suggestedSubtasks} onAddSubtasks={handleAddSuggestedSubtasks}/>
    </>
  );
};

export default TaskDetailModal;