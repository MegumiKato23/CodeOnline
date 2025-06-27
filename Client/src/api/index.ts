import axios, { AxiosInstance } from 'axios';

// 类型定义
export interface User {
  id: string;
  username: string;
  account: string;
  avatar?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  ownerId?: string;
  files?: File[];
  createdAt?: Date;
  updatedAt?: Date;
}

export enum FileType {
  HTML = 'HTML',
  CSS = 'CSS',
  JS = 'JS',
  JSX = 'JSX',
  TS = 'TS',
  VUE = 'VUE',
  SCSS = 'SCSS',
  LESS = 'LESS',
}

export interface File {
  id: string;
  name: string;
  path: string;
  content: string;
  type: FileType;
  projectId: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  async healthCheck(): Promise<{ code: number; message: string; timestamp: string }> {
    const response = await this.client.get<{ code: number; message: string; timestamp: string }>('/health');
    return response.data;
  }

  // 用户相关API
  async register(data: RegisterRequest): Promise<{ code: number; message: string }> {
    const response = await this.client.post<{ code: number; message: string }>('/users/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.post<{ code: number; message: string; data: any }>('/users/login', data);
    return response.data;
  }

  async logout(): Promise<{ code: number; message: string }> {
    const response = await this.client.post<{ code: number; message: string }>('/users/logout');
    return response.data;
  }

  async updateUserProfile(data: UpdateUserRequest): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.put<{ code: number; message: string; data: any }>('/users/profile', data);
    return response.data;
  }

  async getUserProfile(): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>('/users/profile');
    return response.data;
  }

  async getUserProjects(): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>('/users/project');
    return response.data;
  }

  async refreshToken(): Promise<{ code: number; message: string }> {
    const response = await this.client.post<{ code: number; message: string }>('/users/auth/refresh');
    return response.data;
  }

  // 项目相关API
  async createProject(data: CreateProjectRequest): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.post<{ code: number; message: string; data: any }>('/projects', data);
    return response.data;
  }

  async getProject(projectId: string): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.put<{ code: number; message: string; data: any }>(
      `/projects/${projectId}`,
      data
    );
    return response.data;
  }

  async deleteProject(projectId: string): Promise<{ code: number; message: string }> {
    const response = await this.client.delete<{ code: number; message: string }>(`/projects/${projectId}`);
    return response.data;
  }

  async getShareLink(
    projectId: string
  ): Promise<{ code: number; message: string; data: { shareId: string; expiresAt: Date } }> {
    const response = await this.client.get<{
      code: number;
      message: string;
      data: { shareId: string; expiresAt: Date };
    }>(`/projects/share/${projectId}`);
    return response.data;
  }

<<<<<<< HEAD
  async getSharedProject(shareId: string): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>(
      `/projects/share/to/${shareId}`
    );
=======
  async getSharedProject(shareId: string): Promise<{ project: Project }> {
    // console.log(shareId);
    const response = await this.client.get<{ project: Project }>(`/projects/share/to/${shareId}`);
    console.log(response.data);
>>>>>>> f1dc8bf9c5481737b6f49abe5c9943a378ad18f2
    return response.data;
  }

  // 文件相关API
  async createFile(projectId: string, data: CreateFileRequest): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.post<{ code: number; message: string; data: any }>(
      `/projects/${projectId}/files`,
      data
    );
    return response.data;
  }

  async getFile(projectId: string, fileId: string): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>(
      `/projects/${projectId}/files/${fileId}`
    );
    return response.data;
  }

  async updateFile(
    projectId: string,
    fileId: string,
    data: UpdateFileRequest
  ): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.put<{ code: number; message: string; data: any }>(
      `/projects/${projectId}/files/${fileId}`,
      data
    );
    return response.data;
  }

  async deleteFile(projectId: string, fileId: string): Promise<{ code: number; message: string }> {
    const response = await this.client.delete<{ code: number; message: string }>(
      `/projects/${projectId}/files/${fileId}`
    );
    return response.data;
  }
}

export const api = new ApiClient();

// export default api;
export interface FileContent {
  id: string;
  name: string;
  path: string;
  content: string;
  type: FileType;
  projectId: string;
}

export interface SaveCodeRequest {
  userId: string;
  file: FileContent;
}

export interface GetCodeResponse {
  files: FileContent[];
}

interface CodeData {
  html: string;
  css: string;
  js: string;
}
export default {
  saveCode: (data: { userId: string; html: string; css: string; js: string }) =>
    axios.post('http://localhost:3001/api/code/save', data),

  getCode: (userId: string) => axios.get<CodeData>(`http://localhost:3001/api/code/${userId}`),
};
