import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

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
  private isRefreshing: boolean = false;
  private failedRequests: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    config: AxiosRequestConfig;
  }[] = [];

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
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // 处理错误响应
        if (error.response) {
          if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
              if (this.isRefreshing) {
                return new Promise((resolve, reject) => {
                  this.failedRequests.push({ resolve, reject, config: originalRequest });
                });
              }
              this.isRefreshing = true;
              await this.refreshToken();
              this.isRefreshing = false;
              // 重试原始请求
              const retryResponse = await this.client(originalRequest);
              // 处理等待队列中的请求
              this.processFailedRequests();
              return retryResponse;
            } catch (refreshError) {
              // 刷新token失败
              this.failedRequests.forEach((request) => {
                request.reject(refreshError);
              });
              this.failedRequests = [];
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

  private processFailedRequests() {
    this.failedRequests.forEach((request) => {
      request.resolve(
        this.client(request.config)
          .then((response) => {
            request.resolve(response);
          })
          .catch((error) => {
            request.reject(error);
          })
      );
    });
    this.failedRequests = [];
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

  async refreshToken(): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.post<{ code: number; message: string; data: any }>('/users/auth/refresh');
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

  async getSharedProject(shareId: string): Promise<{ code: number; message: string; data: any }> {
    const response = await this.client.get<{ code: number; message: string; data: any }>(
      `/projects/share/to/${shareId}`
    );
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
  // 修改 saveCode 方法
  async saveCode(data: {
    userId: string;
    files: Array<{
      name: string;
      path: string;
      content: string;
      type: FileType;
    }>;
  }): Promise<any> {
    return this.client.post('http://localhost:3001/api/code/save', data);
  }

  // 修改 getCode 方法
  async getCode(userId: string): Promise<{
    data: {
      files: Array<{
        name: string;
        path: string;
        content: string;
        type: FileType;
      }>;
    };
  }> {
    return this.client.get(`http://localhost:3001/api/code/${userId}`);
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
