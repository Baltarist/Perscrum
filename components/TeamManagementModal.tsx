import React, { useState } from 'react';
import { Project, User, TeamMember } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProjectData } from '../hooks/useProjectData';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, onClose, project }) => {
  const { getUserById } = useAuth();
  const { inviteTeamMemberByEmail, removeTeamMember } = useProjectData();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Üye');
  const [inviteStatus, setInviteStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const teamMembers = project.teamMembers.map(tm => ({ ...tm, user: getUserById(tm.userId) })).filter(tm => tm.user);

  if (!isOpen) return null;
  
  const handleInviteMember = async () => {
    if (inviteEmail) {
        setIsInviting(true);
        setInviteStatus(null);
        const result = await inviteTeamMemberByEmail(project.id, inviteEmail, inviteRole);
        setInviteStatus({ message: result.message, isError: !result.success });
        if(result.success) {
            setInviteEmail('');
        }
        setIsInviting(false);
        setTimeout(() => setInviteStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Takımı Yönet: {project.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Mevcut Üyeler ({teamMembers.length}/10)</h3>
            <div className="space-y-2">
                {teamMembers.map(({ user, role }) => user && (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <img className="w-8 h-8 rounded-full" src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.displayName} />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.displayName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                            </div>
                        </div>
                        {role !== 'Lider' && (
                             <button onClick={() => removeTeamMember(project.id, user.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                                Kaldır
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>
          
          {project.teamMembers.length < 10 && (
            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">E-posta ile Davet Et</h3>
                <div className="flex space-x-2">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="uye@ornek.com"
                        className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                     <button onClick={handleInviteMember} disabled={!inviteEmail || isInviting} className="flex items-center space-x-2 py-2 px-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:bg-primary-300">
                        <PlusIcon className={`w-5 h-5 ${isInviting ? 'animate-spin' : ''}`} />
                        <span>{isInviting ? '...' : 'Davet Et'}</span>
                    </button>
                </div>
                 {inviteStatus && <p className={`text-xs mt-2 ${inviteStatus.isError ? 'text-red-500' : 'text-green-500'}`}>{inviteStatus.message}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementModal;