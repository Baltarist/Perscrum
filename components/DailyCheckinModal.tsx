import React, { useState, useEffect, useRef } from 'react';
import { createAIChatSession, findTaskFromUserText } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import { Chat } from '@google/genai';
import { useProjectData } from '../hooks/useProjectData';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, Task, Project } from '../types';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ isOpen, onClose, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [hasRecordedCheckin, setHasRecordedCheckin] = useState(false);
  
  const { projects, recordCheckin, saveChatHistory, getDailyAIContext } = useProjectData();
  const { setDailyFocusTask, currentUser } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const activeProject = projects.find(p => p.status === 'active');
  const activeSprint = activeProject?.sprints.find(s => s.status === 'active');

  useEffect(() => {
    if (isOpen && activeSprint && currentUser) {
      const initialHistory = activeSprint.chatHistory || [];
      setMessages(initialHistory);
      
      const context = getDailyAIContext();
      const session = createAIChatSession(context, currentUser.settings.aiCoachName, initialHistory);
      setChatSession(session);
      setHasRecordedCheckin(false);

      if (initialHistory.length === 0) {
        setIsLoading(true);
        const userMessageText = `Merhaba, ben ${userName}. Günlük check-in için hazırım. Projedeki son durumu gözden geçirip güne başlayalım.`;
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: userMessageText }] };

        session.sendMessageStream({ message: userMessageText })
            .then(async (stream) => {
                let aiResponse = '';
                setMessages([userMessage, { role: 'model', parts: [{ text: '' }] }]);
                setIsLoading(false);
                
                for await (const chunk of stream) {
                    aiResponse += chunk.text;
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { role: 'model', parts: [{ text: aiResponse }] };
                        return updated;
                    });
                }
                
                const aiMessage: ChatMessage = { role: 'model', parts: [{ text: aiResponse }] };
                const finalHistory: ChatMessage[] = [userMessage, aiMessage];
                saveChatHistory(activeProject!.id, activeSprint.id, finalHistory);
            })
            .catch(error => {
                console.error("AI ile ilk mesaj gönderilirken hata oluştu:", error);
                const errorMsg: ChatMessage = { role: 'model', parts: [{ text: "Üzgünüm, şu anda bağlantı kuramıyorum. Lütfen daha sonra tekrar dene." }]};
                setMessages([userMessage, errorMsg]);
                setIsLoading(false);
                if (activeProject && activeSprint) {
                  saveChatHistory(activeProject.id, activeSprint.id, [userMessage, errorMsg]);
                }
            });
      }
    } else if (!isOpen) {
      setMessages([]);
      setUserInput('');
      setChatSession(null);
    }
  }, [isOpen, activeSprint, userName, saveChatHistory, activeProject, getDailyAIContext, currentUser]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading || !chatSession || !activeProject || !activeSprint) return;

    if (!hasRecordedCheckin) {
      recordCheckin();
      setHasRecordedCheckin(true);
    }

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const userMessageText = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
        const allTasks = projects.flatMap(p => p.sprints.flatMap(s => s.tasks.map(t => ({ id: t.id, title: t.title }))));
        const focusTaskId = await findTaskFromUserText(userMessageText, allTasks);
        if(focusTaskId) {
            setDailyFocusTask(focusTaskId);
        } else {
            setDailyFocusTask(undefined);
        }

        const stream = await chatSession.sendMessageStream({ message: userMessageText });
        
        let aiResponse = '';
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);
        setIsLoading(false);

        for await (const chunk of stream) {
            aiResponse += chunk.text;
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', parts: [{ text: aiResponse }] };
                return updated;
            });
        }
        
        const aiMessage: ChatMessage = { role: 'model', parts: [{ text: aiResponse }] };
        const finalHistory = [...currentMessages, aiMessage];
        saveChatHistory(activeProject.id, activeSprint.id, finalHistory);

    } catch(error) {
        console.error("AI'ya mesaj gönderilirken hata oluştu:", error);
        const errorMsg: ChatMessage = { role: 'model', parts: [{ text: "Bir sorun oluştu. Lütfen tekrar deneyin."}] };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
        const finalHistory = [...currentMessages, errorMsg];
        saveChatHistory(activeProject.id, activeSprint.id, finalHistory);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-primary-500"/>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Günlük AI Koçu</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.parts[0]?.text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages.length === 0 && (
              <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="max-w-md p-3 rounded-xl bg-gray-200 dark:bg-gray-700">
                      <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Bugün neye odaklanacaksın?"
              className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !userInput.trim()}
              className="bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              Gönder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckinModal;