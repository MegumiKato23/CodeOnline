const axios = require('axios');

const baseURL = 'http://localhost:8080';
const api = axios.create({ baseURL });

let authToken = '';
let userId = '';
let projectId = '';
let fileId = '';

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

async function testAPI() {
  try {
    console.log('🧪 开始API测试...\n');

    // 1. 健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await api.get('/health');
    console.log('✅ 健康检查成功:', healthResponse.data);

    // 2. 用户注册
    console.log('\n2. 测试用户注册...');
    const registerResponse = await api.post('/users/register', testUser);
    console.log('✅ 用户注册成功:', registerResponse.data);
    userId = registerResponse.data.id;

    const registerResponse1 = await api.post('/users/register', testUser1);
    console.log('✅ 用户注册成功:', registerResponse1.data);

    const registerResponse2 = await api.post('/users/register', testUser2);
    console.log('✅ 用户注册成功:', registerResponse2.data);


    // 3. 用户登录
    console.log('\n3. 测试用户登录...');
    const loginResponse = await api.post('/users/login', {
      account: testUser.account,
      password: testUser.password
    });
    console.log('✅ 用户登录成功:', loginResponse.data);
    authToken = loginResponse.data.access_token;
    
    // 设置认证头
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 4. 获取用户资料
    console.log('\n4. 测试获取用户资料...');
    const profileResponse = await api.get(`/users/profile/${userId}`);
    console.log('✅ 获取用户资料成功:', profileResponse.data);

    // 5. 更新用户资料
    console.log('\n5. 测试更新用户资料...');
    const updateProfileResponse = await api.put('/users/profile', {
      user: {
        id: userId,
        username: 'updateduser',
        account: testUser.account,
        avatar: 'https://example.com/avatar.jpg'
      }
    });
    console.log('✅ 更新用户资料成功:', updateProfileResponse.data);

    // 6. 创建项目
    console.log('\n6. 测试创建项目...');
    const createProjectResponse = await api.post('/projects', testProject);
    console.log('✅ 创建项目成功:', createProjectResponse.data);
    projectId = createProjectResponse.data.id;

    // 7. 获取项目
    console.log('\n7. 测试获取项目...');
    const getProjectResponse = await api.get(`/projects/${projectId}`);
    console.log('✅ 获取项目成功:', getProjectResponse.data);

    // 8. 更新项目
    console.log('\n8. 测试更新项目...');
    const updateProjectResponse = await api.put(`/projects/${projectId}`, {
      name: 'Updated Test Project'
    });
    console.log('✅ 更新项目成功:', updateProjectResponse.data);

    // 9. 创建文件
    console.log('\n9. 测试创建文件...');
    const createFileResponse = await api.post(`/projects/${projectId}/files`, testFile);
    console.log('✅ 创建文件成功:', createFileResponse.data);
    fileId = createFileResponse.data.id;

    // 10. 获取文件
    console.log('\n10. 测试获取文件...');
    const getFileResponse = await api.get(`/projects/${projectId}/files/${fileId}`);
    console.log('✅ 获取文件成功:', getFileResponse.data);

    // 11. 更新文件
    console.log('\n11. 测试更新文件...');
    const updateFileResponse = await api.put(`/projects/${projectId}/files/${fileId}`, {
      ...testFile,
      content: '<!DOCTYPE html><html><head><title>Updated Test</title></head><body><h1>Updated Hello World</h1></body></html>'
    });
    console.log('✅ 更新文件成功:', updateFileResponse.data);

    // 12. 获取用户项目集
    console.log('\n12. 测试获取用户项目集...');
    const userProjectsResponse = await api.get(`/users/project/${userId}`);
    console.log('✅ 获取用户项目集成功:', userProjectsResponse.data);

    // 13. 获取分享链接
    console.log('\n13. 测试获取分享链接...');
    const shareResponse = await api.get(`/projects/share/${projectId}`);
    console.log('✅ 获取分享链接成功:', shareResponse.data);

    // 14. 删除文件
    console.log('\n14. 测试删除文件...');
    const deleteFileResponse = await api.delete(`/projects/${projectId}/files/${fileId}`);
    console.log('✅ 删除文件成功:', deleteFileResponse.data);

    // 15. 删除项目
    console.log('\n15. 测试删除项目...');
    const deleteProjectResponse = await api.delete(`/projects/${projectId}`);
    console.log('✅ 删除项目成功:', deleteProjectResponse.data);

    console.log('\n🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testAPI();

