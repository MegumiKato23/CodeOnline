# CodeOnline API 文档

使用Express.js + Prisma构建。

## 基础信息

- **Base URL**: http://localhost:8080
- **认证方式**: JWT 
- **数据格式**: JSON

## API 接口

### 1. 用户接口

#### 1.1 用户注册
- **方法**: POST
- **路径**: `/users/register`
- **请求体**:
```json
{
  "username": "string, 必填, 3-20字符",
  "account": "string, 必填, 手机号格式",
  "password": "string, 必填, 6-30字符，必须包含大小写",
  "confirmPassword": "string, 必填, 需与password一致"
}
```
- **响应**:
```json
{
  "id": "string, 用户ID",
  "username": "string, 用户名",
  "account": "string, 账户",
  "createdAt": "string, ISO8601时间格式"
}
```

#### 1.2 用户登录
- **方法**: POST
- **路径**: `/users/login`
- **请求体**:
```json
{
  "account": "string, 必填",
  "password": "string, 必填"
}
```
- **响应**:
```json
{
  "user": {
    "id": "string, 用户ID",
    "username": "string, 用户名",
    "account": "string, 账户",
    "avatar": "string, 头像URL",
    "status": "string, 状态栏"
  }
}
```

#### 1.3 更新用户资料
- **方法**: PUT
- **路径**: `/users/profile`
- **认证**: 需要Token
- **请求体**:
```json
{
  "user": {
    "id": "string, 用户ID",
    "username": "string, 用户名",
    "account": "string, 账户",
    "avatar": "string, 头像URL"
  }
}
```

#### 1.4 获取用户资料
- **方法**: GET
- **路径**: `/users/profile`
- **认证**: 需要Token
- **响应**: 返回用户信息
```json
{
  "user": {
    "id": "string, 用户ID",
    "username": "string, 用户名",
    "account": "string, 账户",
    "avatar": "string, 头像URL",
    "status": "string, 状态栏"
  }
}
```

#### 1.5 获取用户项目集
- **方法**: GET
- **路径**: `/users/project`
- **认证**: 需要Token
- **响应**: 返回用户项目集
```json
{
  "projects": [
    {
      "id": "string, 项目ID"
    }
  ]
}
```

#### 1.6 更新token
- **方法**: POST
- **路径**: `/users/auth/refresh`
- **响应**:
```json
{
  "success": true
}
```

### 2. 项目接口

#### 2.1 创建项目
- **方法**: POST
- **路径**: `/projects`
- **认证**: 需要Token
- **请求体**:
```json
{
  "name": "string, 项目名称"
}
```
- **响应**:
```json
{
  "id": "string, 项目ID",
  "ownerId": "string, 所属者ID",
  "name": "string, 项目名",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
``` 

#### 2.2 获取单个项目
- **方法**: GET
- **路径**: `/projects/{projectId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "id": "string, 项目ID",
  "name": "string, 项目名",
  "owner": "User, 所属者信息",
  "files": "File[], 文件数组",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
```

#### 2.3 更新项目
- **方法**: PUT
- **路径**: `/projects/{projectId}`
- **认证**: 需要Token
- **请求体**:
```json
{
  "name": "string, 项目名称",
  "files": "File[], 文件数组"
}
```
- **响应**:
```json
{
  "id": "string, 项目ID",
  "ownerId": "string, 所属者ID",
  "name": "string, 项目名",
  "files": "File[], 文件数组",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
``` 

#### 2.4 删除项目
- **方法**: DELETE
- **路径**: `/projects/{projectId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "success": true
}
```

#### 2.5 获取分享短链
- **方法**: GET
- **路径**: `/projects/share/{projectId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "shareUrl": "string, 分享链接",
  "shareId": "string, 分享id",
  "expiresAt": "Date, 到期时间"
}
```

#### 2.6 获取分享项目
- **方法**: GET
- **路径**: `/share/{shareId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "id": "string, 项目ID",
  "name": "string, 项目名",
  "owner": "User, 所属者信息",
  "files": "File[], 文件数组",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
```

### 3. 文件接口

#### 3.1 创建文件
- **方法**: POST
- **路径**: `/projects/{projectId}/files`
- **认证**: 需要Token
- **请求体**:
```json
{
  "name": "string, 文件名",
  "path": "string, 文件路径",
  "content": "string, 文件内容",
  "type": "string, 文件类型(HTML|CSS|JS|JSX|TS|VUE|SCSS|LESS)"
}
```
- **响应**:
```json
{
  "id": "string, 文件id",
  "name": "string, 文件名",
  "path": "string, 文件路径",
  "content": "string, 文件内容",
  "type": "string, 文件类型(HTML|CSS|JS|JSX|TS|VUE|SCSS|LESS)",
  "projectId": "string, 所属项目ID",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
```

#### 3.2 更新文件
- **方法**: PUT
- **路径**: `/projects/{projectId}/files/{fileId}`
- **认证**: 需要Token
- **请求体**:
```json
{
  "name": "string, 文件名",
  "path": "string, 文件路径",
  "content": "string, 文件内容",
  "type": "string, 文件类型(HTML|CSS|JS|JSX|TS|VUE|SCSS|LESS)"
}
```
- **响应**:
```json
{
  "id": "string, 文件id",
  "name": "string, 文件名",
  "path": "string, 文件路径",
  "content": "string, 文件内容",
  "type": "string, 文件类型(HTML|CSS|JS|JSX|TS|VUE|SCSS|LESS)",
  "projectId": "string, 所属项目ID",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
```

#### 3.3 删除文件
- **方法**: DELETE
- **路径**: `/projects/{projectId}/files/{fileId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "success": true
}
```

#### 3.4 获取文件
- **方法**: GET
- **路径**: `/projects/{projectId}/files/{fileId}`
- **认证**: 需要Token
- **响应**:
```json
{
  "id": "string, 文件id",
  "name": "string, 文件名",
  "path": "string, 文件路径",
  "content": "string, 文件内容",
  "type": "string, 文件类型(HTML|CSS|JS|JSX|TS|VUE|SCSS|LESS)",
  "projectId": "string, 所属项目ID",
  "createdAt": "Date, 创建时间", 
  "updatedAt": "Date, 更新时间"
}
```

## 数据库架构

使用Prisma ORM，支持以下模型：
- **User**: 用户信息
- **Project**: 项目信息
- **File**: 文件信息
- **Share**: 分享记录

所有关联关系都配置了级联删除。

## 安全特性

1. **密码加密**: 使用bcryptjs进行密码哈希
2. **JWT认证**: 使用jsonwebtoken进行身份验证
3. **输入验证**: 使用express-validator进行请求验证
4. **CORS**: 配置跨域资源共享
5. **Helmet**: 设置安全HTTP头


## 测试

运行API测试脚本:
```bash
node test-api.js
```

## 错误处理

- **400**: 请求参数错误
- **401**: 未授权访问
- **403**: 权限不足
- **404**: 资源未找到
- **500**: 服务器内部错误

所有错误响应格式:
```json
{
  "error": "错误描述"
}
```

