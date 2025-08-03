import api from './api';
import { 
  ProjectResponse, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  SprintResponse,
  CreateSprintRequest,
  UpdateSprintRequest,
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest
} from '../types/api';

export const projectService = {
  // Project Management
  getProjects: async (): Promise<ProjectResponse> => {
    const response = await api.get<ProjectResponse>('/projects');
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>('/projects', data);
    return response.data;
  },

  getProject: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.get<ProjectResponse>(`/projects/${projectId}`);
    return response.data;
  },

  updateProject: async (projectId: string, data: UpdateProjectRequest): Promise<ProjectResponse> => {
    const response = await api.put<ProjectResponse>(`/projects/${projectId}`, data);
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.delete<ProjectResponse>(`/projects/${projectId}`);
    return response.data;
  },

  completeProject: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.post<ProjectResponse>(`/projects/${projectId}/complete`);
    return response.data;
  },

  getProjectStats: async (projectId: string): Promise<ProjectResponse> => {
    const response = await api.get<ProjectResponse>(`/projects/${projectId}/stats`);
    return response.data;
  },

  // Sprint Management
  getProjectSprints: async (projectId: string): Promise<SprintResponse> => {
    const response = await api.get<SprintResponse>(`/projects/${projectId}/sprints`);
    return response.data;
  },

  createSprint: async (projectId: string, data: CreateSprintRequest): Promise<SprintResponse> => {
    const response = await api.post<SprintResponse>(`/projects/${projectId}/sprints`, data);
    return response.data;
  },

  getSprint: async (sprintId: string): Promise<SprintResponse> => {
    const response = await api.get<SprintResponse>(`/sprints/${sprintId}`);
    return response.data;
  },

  updateSprint: async (sprintId: string, data: UpdateSprintRequest): Promise<SprintResponse> => {
    const response = await api.put<SprintResponse>(`/sprints/${sprintId}`, data);
    return response.data;
  },

  startSprint: async (sprintId: string): Promise<SprintResponse> => {
    const response = await api.post<SprintResponse>(`/sprints/${sprintId}/start`);
    return response.data;
  },

  completeSprint: async (sprintId: string, retrospective?: { retrospectiveGood?: string; retrospectiveImprove?: string }): Promise<SprintResponse> => {
    const response = await api.post<SprintResponse>(`/sprints/${sprintId}/complete`, retrospective);
    return response.data;
  },

  getSprintStats: async (sprintId: string): Promise<SprintResponse> => {
    const response = await api.get<SprintResponse>(`/sprints/${sprintId}/stats`);
    return response.data;
  },

  deleteSprint: async (sprintId: string): Promise<SprintResponse> => {
    const response = await api.delete<SprintResponse>(`/sprints/${sprintId}`);
    return response.data;
  },

  // Task Management
  getSprintTasks: async (projectId: string, sprintId: string): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/projects/${projectId}/sprints/${sprintId}/tasks`);
    return response.data;
  },

  createTask: async (projectId: string, sprintId: string, data: CreateTaskRequest): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>(`/projects/${projectId}/sprints/${sprintId}/tasks`, data);
    return response.data;
  },

  getTask: async (taskId: string): Promise<TaskResponse> => {
    const response = await api.get<TaskResponse>(`/tasks/${taskId}`);
    return response.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/tasks/${taskId}`, data);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: string): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  assignTask: async (taskId: string, assigneeId: string): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/tasks/${taskId}/assign`, { assigneeId });
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<TaskResponse> => {
    const response = await api.delete<TaskResponse>(`/tasks/${taskId}`);
    return response.data;
  },

  getUserTasks: async (status?: string, limit?: number): Promise<TaskResponse> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get<TaskResponse>(`/users/tasks?${params.toString()}`);
    return response.data;
  },

  // Subtask Management
  createSubtask: async (taskId: string, data: { title: string; assigneeId?: string }): Promise<TaskResponse> => {
    const response = await api.post<TaskResponse>(`/tasks/${taskId}/subtasks`, data);
    return response.data;
  },

  updateSubtask: async (subtaskId: string, data: { title?: string; isCompleted?: boolean; assigneeId?: string }): Promise<TaskResponse> => {
    const response = await api.put<TaskResponse>(`/subtasks/${subtaskId}`, data);
    return response.data;
  },

  deleteSubtask: async (subtaskId: string): Promise<TaskResponse> => {
    const response = await api.delete<TaskResponse>(`/subtasks/${subtaskId}`);
    return response.data;
  },

  // Team Management
  getTeamMembers: async (projectId: string): Promise<any> => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  addTeamMember: async (projectId: string, email: string, role: string = 'member'): Promise<any> => {
    const response = await api.post(`/projects/${projectId}/members`, { email, role });
    return response.data;
  },

  removeTeamMember: async (projectId: string, memberId: string): Promise<any> => {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  }
};