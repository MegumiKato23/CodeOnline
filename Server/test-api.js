const axios = require('axios');
const assert = require('assert').strict;

const baseURL = 'http://localhost:8080';
const api = axios.create({
    baseURL,
    withCredentials: true 
});

// 测试数据
const testUser = {
    username: 'testuser',
    account: 'test@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
};

const testUser1 = {
    username: 'testuser1',
    account: 'test1@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
};

const testUser2 = {
    username: 'testuser2',
    account: 'test2@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
};

const testProject = {
    name: 'Test Project'
};

const testFile = {
    name: 'index.html',
    path: '/index.html',
    content: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>',
    type: 'HTML'
};

const testCssFile = {
    name: 'styles.css',
    path: '/styles.css',
    content: 'body { font-family: Arial, sans-serif; color: #333; }',
    type: 'CSS'
};

// 辅助函数：等待指定时间
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 辅助函数：断言测试
const assertTest = (condition, message) => {
    try {
        assert(condition, message);
        console.log(`✅ 断言成功: ${message}`);
        return true;
    } catch (error) {
        console.error(`❌ 断言失败: ${message}`);
        return false;
    }
};

// 测试套件
const tests = {
    constructor() {
        this.cookie = null; // 存储session cookie
        this.userId = null; // 存储用户ID
        this.projectId = null; // 存储项目ID
        this.fileId = null; // 存储文件ID
        this.shareId = null; // 存储分享ID
        this.files = null; // 存储文件数组
    },

  // 健康检查测试
  async healthCheck() {
        console.log('1. 测试健康检查...');
        try {
            const response = await api.get('/health');
            assertTest(response.status === 200, '健康检查状态码应为200');
            console.log('✅ 健康检查成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 健康检查失败:', error.message);
            return false;
        }
    },

    // 用户注册测试
    async userRegistration() {
        console.log('2. 测试用户注册...');

        // 测试有效注册
        try {
          const response = await api.post('/users/register', testUser);
          assertTest(response.status === 200, '注册状态码应为200');
          console.log('✅ 用户注册成功:', response.data);

          // 注册其他测试用户
          await api.post('/users/register', testUser1);
          await api.post('/users/register', testUser2);

          return true;
        } catch (error) {
          console.error('❌ 用户注册失败:', error.response?.data || error.message);
          return false;
        }
    },

    // 用户登录测试
    async userLogin() {
        console.log('3. 测试用户登录...');

        // 测试有效登录
        try {
            const response = await api.post('/users/login', {
                account: testUser.account,
                password: testUser.password
            });

            const { user } = response.data.data;

            assertTest(response.status === 200, '登录状态码应为200');
            assertTest(user.id, '应返回用户ID');

            // 检查cookie中是否有token 
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                console.log('✅ 服务器设置了认证Cookie');
            }

            // 保存登录后的cookie
            this.cookie = response.headers['set-cookie'];
            this.userId = user.id;

            console.log('✅ 用户登录成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 用户登录失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 获取用户资料测试
    async getUserProfile() {
        console.log('4. 测试获取用户资料...');
        try {
            const response = await api.get('/users/profile', {
                headers: { Cookie: this.cookie }
            });

            const { user } = response.data.data;

            assertTest(response.status === 200, '获取资料状态码应为200');
            assertTest(user.id === this.userId, '应返回正确的用户ID');

            console.log('✅ 获取用户资料成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取用户资料失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 更新用户资料测试
    async updateUserProfile() {
        console.log('5. 测试更新用户资料...');
        try {
            const response = await api.put('/users/profile', {
                user: {
                    id: this.userId,
                    username: 'updateduser',
                    account: testUser.account,
                    avatar: 'https://example.com/avatar.jpg'
                }
            }, {
                headers: { Cookie: this.cookie }
            });

            const { user } = response.data.data;

            assertTest(response.status === 200, '更新资料状态码应为200');
            assertTest(user.username === 'updateduser', '应返回更新后的用户名');
            assertTest(user.avatar === 'https://example.com/avatar.jpg', '应返回更新后的头像');

            console.log('✅ 更新用户资料成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 更新用户资料失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 创建项目测试
    async createProject() {
        console.log('6. 测试创建项目...');
        try {
            const response = await api.post('/projects', testProject, {
                headers: { Cookie: this.cookie }
            });

            const { project } = response.data.data;

            assertTest(response.status === 200, '创建项目状态码应为200');
            assertTest(project.id, '应返回项目ID');
            assertTest(project.name === testProject.name, '应返回正确的项目名');
            assertTest(project.ownerId === this.userId, '应返回正确的所有者ID');

            this.projectId = project.id;
            console.log('✅ 创建项目成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 创建项目失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 创建文件测试
    async createFile() {
        console.log('7. 测试创建文件...');
        try {
            const response = await api.post(`/projects/${projectId}/files`, testFile, {
                headers: { Cookie: this.cookie }
            });

            const { file } = response.data.data;

            assertTest(response.status === 200, '创建文件状态码应为200');
            assertTest(file.id, '应返回文件ID');
            assertTest(file.name === testFile.name, '应返回正确的文件名');
            assertTest(file.path === testFile.path, '应返回正确的文件路径');
            assertTest(file.content === testFile.content, '应返回正确的文件内容');
            assertTest(file.type === testFile.type, '应返回正确的文件类型');

            this.fileId = file.id;
            console.log('✅ 创建文件成功:', response.data);

            // 创建第二个文件用于测试
            const cssResponse = await api.post(`/projects/${projectId}/files`, testCssFile, {
                headers: { Cookie: this.cookie }
            });
            console.log('✅ 创建CSS文件成功:', cssResponse.data);

            return true;
        } catch (error) {
            console.error('❌ 创建文件失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 获取项目测试
    async getProject() {
        console.log('8. 测试获取项目...');
        try {
            const response = await api.get(`/projects/${projectId}`, {
                headers: { Cookie: this.cookie }
            });

            const { project } = response.data.data;

            assertTest(response.status === 200, '获取项目状态码应为200');
            assertTest(project.id === this.projectId, '应返回正确的项目ID');
            assertTest(project.name === testProject.name, '应返回正确的项目名');
            assertTest(Array.isArray(project.files), '应返回文件数组');

            this.files = project.files;
            console.log('✅ 获取项目成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取项目失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 更新项目测试
    async updateProject() {
        console.log('9. 测试更新项目...');
        try {
            const response = await api.put(`/projects/${projectId}`, {
                name: 'Updated Test Project'
            }, {
                headers: { Cookie: this.cookie }
            });

            const { project } = response.data.data;

            assertTest(response.status === 200, '更新项目状态码应为200');
            assertTest(project.id === this.projectId, '应返回正确的项目ID');
            assertTest(project.name === 'Updated Test Project', '应返回更新后的项目名');

            console.log('✅ 更新项目成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 更新项目失败:', error.response?.data || error.message);
            return false;
        }
    },


    // 获取文件测试
    async getFile() {
        console.log('10. 测试获取文件...');
        try {
            const response = await api.get(`/projects/${projectId}/files/${fileId}`, {
                headers: { Cookie: this.cookie }
            });

            const { file } = response.data.data;

            assertTest(response.status === 200, '获取文件状态码应为200');
            assertTest(file.id === fileId, '应返回正确的文件ID');
            assertTest(file.name === testFile.name, '应返回正确的文件名');
            assertTest(file.path === testFile.path, '应返回正确的文件路径');
            assertTest(file.content === testFile.content, '应返回正确的文件内容');
            assertTest(file.type === testFile.type, '应返回正确的文件类型');

            console.log('✅ 获取文件成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取文件失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 更新文件测试
    async updateFile() {
        console.log('11. 测试更新文件...');
        try {
            const updatedContent = '<!DOCTYPE html><html><head><title>Updated Test</title></head><body><h1>Updated Hello World</h1></body></html>';

            const response = await api.put(`/projects/${projectId}/files/${fileId}`, {
                ...testFile,
                content: updatedContent
            }, {
                headers: { Cookie: this.cookie }
            });

            const { file } = response.data.data;

            assertTest(response.status === 200, '更新文件状态码应为200');
            assertTest(file.id === fileId, '应返回正确的文件ID');
            assertTest(file.content === updatedContent, '应返回更新后的文件内容');

            console.log('✅ 更新文件成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 更新文件失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 获取用户项目集测试
    async getUserProjects() {
        console.log('12. 测试获取用户项目集...');
        try {
            const response = await api.get(`/users/project`, {
                headers: { Cookie: this.cookie }
            });

            const { projects } = response.data.data;

            assertTest(response.status === 200, '获取用户项目集状态码应为200');
            assertTest(Array.isArray(projects), '应返回项目数组');
            assertTest(projects.some(p => p.id === projectId), '应包含已创建的项目');

            console.log('✅ 获取用户项目集成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取用户项目集失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 获取分享链接测试
    async getShareLink() {
        console.log('13. 测试获取分享链接...');
        try {
            const response = await api.get(`/projects/share/${projectId}`, {
                headers: { Cookie: this.cookie }
            });

            assertTest(response.status === 200, '获取分享链接状态码应为200');
            assertTest(response.data.data.expiresAt, '应返回过期时间');

            this.shareId = response.data.data.shareId;
            console.log('✅ 获取分享链接成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取分享链接失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 获取分享项目测试
    async getShareProject() {
        console.log('14. 测试获取分享项目...');
        try {
            const response = await api.get(`/projects/share/to/${shareId}`, {
                headers: { Cookie: this.cookie }
            });

            const { project } = response.data.data;

            assertTest(response.status === 200, '获取分享项目状态码应为200');
            assertTest(project.id === projectId, '应返回正确的项目ID');

            console.log('✅ 获取分享项目成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 获取分享项目失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 删除文件测试
    async deleteFile() {
        console.log('15. 测试删除文件...');
        try {
            const response = await api.delete(`/projects/${projectId}/files/${fileId}`, {
                headers: { Cookie: this.cookie }
            });

            assertTest(response.status === 200, '删除文件状态码应为200');

            console.log('✅ 删除文件成功:', response.data);

            // 验证文件已被删除
            try {
                await api.get(`/projects/${projectId}/files/${fileId}`);
                console.error('❌ 文件删除验证失败: 文件仍然可以访问');
                return false;
            } catch (error) {
                assertTest(error.response.status === 404, '已删除文件应返回404状态码');
                console.log('✅ 文件删除验证通过: 文件已不可访问');
            }

            return true;
        } catch (error) {
            console.error('❌ 删除文件失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 删除项目测试
    async deleteProject() {
        console.log('16. 测试删除项目...');
        try {
            const response = await api.delete(`/projects/${projectId}`, {
                headers: { Cookie: this.cookie }
            });

            assertTest(response.status === 200, '删除项目状态码应为200');
            console.log('✅ 删除项目成功:', response.data);

            // 验证项目已被删除
            try {
                await api.get(`/projects/${projectId}`, {
                    headers: { Cookie: this.cookie }
                });
                console.error('❌ 项目删除验证失败: 项目仍然可以访问');
                return false;
            } catch (error) {
                console.log('✅ 删除项目成功:', response.data);
            }
            return true;
        } catch (error) {
            console.error('❌ 删除项目失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 用户登出测试
    async userLogout() {
        console.log('17. 测试用户登出...');
        try {
            const response = await api.post('/users/logout', {}, {
                headers: { Cookie: this.cookie }
            });

            assertTest(response.status === 200, '登出状态码应为200');

            console.log('✅ 用户登出成功:', response.data);
            return true;
        } catch (error) {
            console.error('❌ 用户登出失败:', error.response?.data || error.message);
            return false;
        }
    },

    // 错误处理测试
    async errorHandling() {
        console.log('18. 测试错误处理...');

        // 测试404路由
        try {
            await api.get('/nonexistent-route');
            console.error('❌ 404路由测试失败: 应该返回404');
            return false;
        } catch (error) {
            assertTest(error.response.status === 404, '不存在的路由应返回404状态码');
            console.log('✅ 404路由测试通过');
        }

        // 测试未授权访问
        try {
            // 清除认证头
            api.defaults.headers.common['Authorization'] = '';
            await api.post('/projects', testProject);
            console.error('❌ 未授权访问测试失败: 应该拒绝未授权请求');
            return false;
        } catch (error) {
            assertTest(error.response.status === 401, '未授权访问应返回401状态码');
            console.log('✅ 未授权访问测试通过');
        }

        return true;
    }
};

// 主测试函数
async function runTests() {
    console.log('🧪 开始API测试...');

    let passedTests = 0;
    let totalTests = Object.keys(tests).length - 1;

    // 按顺序运行测试
    for (const [testName, testFn] of Object.entries(tests)) {
        try {
            const passed = await testFn();
            if (passed) passedTests++;
        } catch (error) {
            console.error(`❌ 测试 ${testName} 发生异常:`, error);
        }

        // 测试之间稍作暂停，避免请求过快
        await wait(500);
    }

    // 测试结果统计
    console.log(`
🎯 测试完成: ${passedTests}/${totalTests} 测试通过`);

    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！API功能正常工作。');
    } else {
        console.log(`⚠️ ${totalTests - passedTests} 个测试失败，请检查日志并修复问题。`);
    }
}

// 运行测试
runTests();