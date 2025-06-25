import axios, { AxiosInstance } from 'axios';

// 类型定义
export interface User {
  id: string;
  username: string;
  account: string;
  avatar?: string;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId?: string;
  owner?: User;
  files?: File[];
  createdAt?: string;
  updatedAt?: string;
}

export enum FileType {
  HTML = 'HTML',
  CSS = 'CSS',
  JS = 'JS',
  JSX = 'JSX',
  TS = 'TS',
  VUE = 'VUE',
  SCSS = 'SCSS',
  LESS = 'LESS'
}

export interface File {
  id: string;
  name: string;
  path: string;
  content: string;
  type: FileType;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  account: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  account: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserRequest {
  user: {
    id: string;
    username: string;
    account: string;
    avatar?: string;
    status?: string;  
  };
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface CreateFileRequest {
  name: string;
  path: string;
  content: string;
  type: FileType;
}

export interface UpdateFileRequest {
  name: string;
  path: string;
  content: string;
  type: FileType;
}

// API客户端类
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:8080';
    this.client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      timeout: 10000,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // 处理错误响应
        if (error.response) {
          console.error('API错误:', error.response.data);
          
          if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await this.refreshToken();
            } catch (refreshError) {
                // 刷新token失败，清除本地存储的用户信息
                // 重定向到登录页面等
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络错误:', error.request);
        } else {
          // 请求配置出错
          console.error('请求错误:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // 用户相关API
  async register(data: RegisterRequest): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>('/users/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<{ user: User }> {
    const response = await this.client.post<{ user: User }>('/users/login', data);
    return response.data;
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>('/users/logout');
    return response.data;
  }

  async updateUserProfile(data: UpdateUserRequest): Promise<{ user: User }> {
    const response = await this.client.put<{ user: User }>('/users/profile', data);
    return response.data;
  }

  async getUserProfile(): Promise<{ user: User }> {
    const response = await this.client.get<{ user: User }>('/users/profile');
    return response.data;
  }

  async getUserProjects(): Promise<{ projects: Project[] }> {
    const response = await this.client.get<{ projects: Project[] }>('/users/project');
    return response.data;
  }

  async refreshToken(): Promise<{ success: boolean }> {
    const response = await this.client.post<{ success: boolean }>('/users/auth/refresh');
    return response.data;
  }

  // 项目相关API
  async createProject(data: CreateProjectRequest): Promise<{ project: Project }> {
    const response = await this.client.post<{ project: Project }>('/projects', data);
    return response.data;
  }

  async getProject(projectId: string): Promise<{ project: Project }> {
    const response = await this.client.get<{ project: Project }>(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<{ project: Project }> {
    const response = await this.client.put<{ project: Project }>(`/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(`/projects/${projectId}`);
    return response.data;
  }

  async getShareLink(projectId: string): Promise<{ shareId: string }> {
    const response = await this.client.get<{ shareId: string }>(`/projects/share/${projectId}`);
    return response.data;
  }

  async getSharedProject(shareId: string): Promise<{ project: Project }> {
    const response = await this.client.get<{ project: Project }>(`/share/to/${shareId}`);
    return response.data;
  }

  // 文件相关API
  async createFile(projectId: string, data: CreateFileRequest): Promise<{ file: File }> {
    const response = await this.client.post<{ file: File }>(`/projects/${projectId}/files`, data);
    return response.data;
  }

  async getFile(projectId: string, fileId: string): Promise<{ file: File }> {
    const response = await this.client.get<{ file: File }>(`/projects/${projectId}/files/${fileId}`);
    return response.data;
  }

  async updateFile(projectId: string, fileId: string, data: UpdateFileRequest): Promise<{ file: File }> {
    const response = await this.client.put<{ file: File }>(`/projects/${projectId}/files/${fileId}`, data);
    return response.data;
  }

  async deleteFile(projectId: string, fileId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete<{ success: boolean }>(`/projects/${projectId}/files/${fileId}`);
    return response.data;
  }
}

export const api = new ApiClient();

export default api;