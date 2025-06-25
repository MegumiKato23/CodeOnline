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

# 如果.env不存在就创建一个
touch .env
```

### 4. 初始化

```bash
npx prisma generate
```

### 5. 创建数据库

```bash
npx prisma migrate dev
```

### 6. 启动服务

```bash
npm start
```

## 数据库操作

### 使用 Prisma Studio（可视化管理）

```bash
npx prisma studio
```

这将在浏览器中打开 Prisma Studio，你可以可视化地查看和编辑数据。

## API 接口

具体的请查看 API 文档。

## 数据库架构

### 数据模型概览

系统包含以下 4 个主要数据模型：

1. **User (用户)** - 管理用户账户和认证信息
2. **Project (项目)** - 管理用户创建的代码项目
3. **File (文件)** - 管理项目中的代码文件
4. **Share (分享)** - 管理项目分享功能

### 详细数据模型

#### User 用户表

```sql
CREATE TABLE `User` (
    -- 用户唯一标识符
    `id` VARCHAR(191) NOT NULL, 
    -- 用户账号，用于登录
    `account` VARCHAR(191) NOT NULL,
    -- 用户昵称
    `name` VARCHAR(191) NOT NULL,
    -- 用户密码
    `password` VARCHAR(191) NOT NULL,
    -- 用户头像URL，允许为空
    `avatar` VARCHAR(191) NULL,
    -- 用户创建时间，自动设置为当前时间
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    -- 用户最后登录时间
    `lastLogin` DATETIME(3) NOT NULL,
    -- 状态栏
    `status` VARCHAR(191) NOT NULL,

    -- 创建账号唯一索引，确保账号不重复
    UNIQUE INDEX `User_account_key`(`account`),
    -- 设置主键
    PRIMARY KEY (`id`)
);
```

#### Project 项目表

```sql
CREATE TABLE `Project` (
    -- 项目唯一标识符
    `id` VARCHAR(191) NOT NULL,
    -- 项目名称
    `name` VARCHAR(191) NULL,
    -- 项目所有者ID
    `ownerId` VARCHAR(191) NOT NULL,
    -- 项目创建时间，自动设置为当前时间
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    -- 项目更新时间，自动设置为当前时间，更新时更新
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
);
```

#### File 文件表

```sql
CREATE TABLE `File` (
    -- 文件唯一标识符
    `id` VARCHAR(191) NOT NULL,
    -- 文件名称
    `name` VARCHAR(191) NULL,
    -- 文件所属项目ID
    `ownerId` VARCHAR(191) NOT NULL,
    -- 文件路径
    `path` VARCHAR(191) NOT NULL,
    -- 文件内容
    `content` LONGTEXT NULL,
    -- 文件类型
    `type` ENUM('HTML', 'CSS', 'JS', 'JSX', 'TS', 'VUE', 'SCSS', 'LESS') NOT NULL,
    -- 文件创建时间，自动设置为当前时间
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    -- 文件更新时间，自动设置为当前时间，更新时更新
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) ;
```

#### Share 分享表

```sql
CREATE TABLE `Share` (
    -- 分享唯一标识符
    `id` VARCHAR(191) NOT NULL,
    -- 分享的项目ID
    `projectId` VARCHAR(191) NOT NULL,
    -- 分享创建时间，自动设置为当前时间
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    -- 分享保持时间
    `keeptime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
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
