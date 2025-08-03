import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { Project, Sprint, Task } from '../types';
import { CreateProjectRequest, CreateSprintRequest, CreateTaskRequest } from '../types/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  currentSprint: Sprint | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Project operations
  loadProjects: () => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<boolean>;
  setCurrentProject: (project: Project | null) => void;
  updateProject: (projectId: string, data: any) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  getProjectById: (projectId: string) => Project | null;
  
  // Sprint operations
  loadProjectSprints: (projectId: string) => Promise<void>;
  createSprint: (projectId: string, data: CreateSprintRequest) => Promise<boolean>;
  setCurrentSprint: (sprint: Sprint | null) => void;
  completeSprint: (projectId: string, sprintId: string, retrospective: { good: string; improve: string }) => Promise<boolean>;
  
  // Task operations
  loadSprintTasks: (projectId: string, sprintId: string) => Promise<void>;
  createTask: (projectId: string, sprintId: string, data: CreateTaskRequest) => Promise<boolean>;
  updateTaskStatus: (taskId: string, status: string) => Promise<boolean>;
  
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.getProjects();
      if (response.success && response.data?.projects) {
        setProjects(response.data.projects);
      } else {
        setError(response.error?.message || 'Failed to load projects');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.createProject(data);
      if (response.success && response.data?.project) {
        setProjects(prev => [response.data!.project, ...prev]);
        return true;
      } else {
        setError(response.error?.message || 'Failed to create project');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create project');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, data: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.updateProject(projectId, data);
      if (response.success && response.data?.project) {
        setProjects(prev => prev.map(p => p.id === projectId ? response.data!.project : p));
        if (currentProject?.id === projectId) {
          setCurrentProject(response.data.project);
        }
        return true;
      } else {
        setError(response.error?.message || 'Failed to update project');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update project');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }
        return true;
      } else {
        setError(response.error?.message || 'Failed to delete project');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete project');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const loadProjectSprints = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.getProjectSprints(projectId);
      if (response.success && response.data?.sprints) {
        // Update current project with sprints
        const projectWithSprints = {
          ...projects.find(p => p.id === projectId),
          sprints: response.data.sprints
        };
        // This would need to be handled in the component that uses this hook
      } else {
        setError(response.error?.message || 'Failed to load sprints');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load sprints');
    } finally {
      setIsLoading(false);
    }
  }, [projects]);

  const createSprint = useCallback(async (projectId: string, data: CreateSprintRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.createSprint(projectId, data);
      if (response.success && response.data?.sprint) {
        // Reload project sprints
        await loadProjectSprints(projectId);
        return true;
      } else {
        setError(response.error?.message || 'Failed to create sprint');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create sprint');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadProjectSprints]);

  const loadSprintTasks = useCallback(async (projectId: string, sprintId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.getSprintTasks(projectId, sprintId);
      if (response.success && response.data?.tasks) {
        setTasks(response.data.tasks);
      } else {
        setError(response.error?.message || 'Failed to load tasks');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (projectId: string, sprintId: string, data: CreateTaskRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.createTask(projectId, sprintId, data);
      if (response.success && response.data?.task) {
        setTasks(prev => [response.data!.task, ...prev]);
        return true;
      } else {
        setError(response.error?.message || 'Failed to create task');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create task');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.updateTaskStatus(taskId, status);
      if (response.success && response.data?.task) {
        setTasks(prev => prev.map(t => t.id === taskId ? response.data!.task : t));
        return true;
      } else {
        setError(response.error?.message || 'Failed to update task status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update task status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProjectById = useCallback((projectId: string): Project | null => {
    return projects.find(p => p.id === projectId) || null;
  }, [projects]);

  const completeSprint = useCallback(async (projectId: string, sprintId: string, retrospective: { good: string; improve: string }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.completeSprint(sprintId, retrospective);
      if (response.success) {
        // Refresh projects to get updated sprint status
        await loadProjects();
        return true;
      } else {
        setError(response.error?.message || 'Failed to complete sprint');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to complete sprint');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadProjects]);

  const value: ProjectContextType = {
    projects,
    currentProject,
    currentSprint,
    tasks,
    isLoading,
    error,
    loadProjects,
    createProject,
    setCurrentProject,
    updateProject,
    deleteProject,
    getProjectById,
    loadProjectSprints,
    createSprint,
    setCurrentSprint,
    completeSprint,
    loadSprintTasks,
    createTask,
    updateTaskStatus,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectApi = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectApi must be used within a ProjectApiProvider');
  }
  return context;
};