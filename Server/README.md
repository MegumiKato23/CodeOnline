# 在线代码编辑器 - 数据库使用说明

## 项目概述

这是一个在线代码编辑器项目的后端服务，使用 Prisma ORM 管理 MySQL 数据库。支持用户管理、项目管理、文件管理和项目分享等功能。

## 技术栈

- **数据库**: MySQL
- **ORM**: Prisma
- **运行时**: Node.js + JavaScript
- **包管理**: npm

## 环境设置

### 1. 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm

### 2. 安装依赖

```bash
npm install
```

### 3. 环境变量配置

`.env` 文件并配置数据库连接：

```env
# 数据库连接URL
# 格式: mysql://用户名:密码@主机:端口/数据库名
DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"

# 示例:
# DATABASE_URL="mysql://root:password123@localhost:3306/codeonline_db"
```

### 4. 数据库初始化

```
npx prisma migrate deploy \
npx prisma generate
```

## 数据库操作

### 使用 Prisma Studio（可视化管理）

```bash
npx prisma studio
```

这将在浏览器中打开 Prisma Studio，你可以可视化地查看和编辑数据。

## API接口

具体的请查看API文档。

## 数据库架构

### 数据模型概览

系统包含以下4个主要数据模型：

1. **User (用户)** - 管理用户账户和认证信息
2. **Project (项目)** - 管理用户创建的代码项目
3. **File (文件)** - 管理项目中的代码文件
4. **Share (分享)** - 管理项目分享功能

### 详细数据模型

#### User 用户表
```sql
CREATE TABLE User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account VARCHAR(255) UNIQUE NOT NULL,  -- 用户账号
  name VARCHAR(255) NOT NULL,            -- 用户姓名
  password VARCHAR(255) NOT NULL,        -- 密码
  avatar VARCHAR(255),                   -- 头像URL (可选)
  createdAt DATETIME DEFAULT NOW(),      -- 创建时间
  lastLogin DATETIME,                    -- 最后登录时间
  status VARCHAR(255) NOT NULL           -- 用户状态
);
```

#### Project 项目表
```sql
CREATE TABLE Project (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),                     -- 项目名称
  ownerId INT NOT NULL,                  -- 项目所有者ID
  createdAt DATETIME DEFAULT NOW(),      -- 创建时间
  updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(), -- 更新时间
  FOREIGN KEY (ownerId) REFERENCES User(id)
);
```

#### File 文件表
```sql
CREATE TABLE File (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),                     -- 文件名
  ownerId INT NOT NULL,                  -- 所属项目ID
  path VARCHAR(255) NOT NULL,            -- 文件路径
  content LONGTEXT,                      -- 文件内容
  type ENUM('HTML', 'CSS', 'JS', 'JSX', 'TS', 'VUE', 'SCSS', 'LESS'), -- 文件类型
  createdAt DATETIME DEFAULT NOW(),      -- 创建时间
  updatedAt DATETIME DEFAULT NOW() ON UPDATE NOW(), -- 更新时间
  FOREIGN KEY (ownerId) REFERENCES Project(id)
);
```

#### Share 分享表
```sql
CREATE TABLE Share (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,                -- 分享的项目ID
  createdAt DATETIME DEFAULT NOW(),      -- 分享创建时间
  keeptime DATETIME NOT NULL,            -- 分享保持时间
  FOREIGN KEY (projectId) REFERENCES Project(id)
);
```

## 数据库维护

### 重置数据库

```bash
# 警告：这将删除所有数据！
npx prisma migrate reset
```

### 查看数据库状态

```bash
npx prisma migrate status
```

### 生成新的迁移

```bash
npx prisma migrate dev --name "描述性名称"
```

## 常见问题

### 1. 连接问题

如果遇到数据库连接错误：
- 检查 MySQL 服务是否运行
- 验证 `.env` 文件中的数据库连接字符串是否正确
- 确保数据库用户有足够的权限

### 2. 架构同步问题

如果数据库架构与 Prisma schema 不同步：
```bash
npx prisma db pull  # 从数据库拉取架构
npx prisma generate # 重新生成客户端
```

### 3. 迁移问题

如果迁移失败：
```bash
npx prisma migrate resolve --rolled-back "迁移名称"
```

---


