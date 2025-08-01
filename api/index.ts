import type { VercelRequest, VercelResponse } from '@vercel/node';
import AV from 'leancloud-storage';

// 初始化LeanCloud - 从环境变量获取配置
AV.init({
  appId: process.env.LEANCLOUD_APP_ID || '',
  appKey: process.env.LEANCLOUD_APP_KEY || '',
  serverURL: process.env.LEANCLOUD_SERVER_URL || ''
});

// 验证LeanCloud配置是否存在
if (!process.env.LEANCLOUD_APP_ID || !process.env.LEANCLOUD_APP_KEY || !process.env.LEANCLOUD_SERVER_URL) {
  console.error('请配置LeanCloud环境变量: LEANCLOUD_APP_ID, LEANCLOUD_APP_KEY, LEANCLOUD_SERVER_URL');
}

// 数据模型定义
interface DataItem {
  id: string;
  title: string;
  content: string;
  type: string;
  passwordHash: string;
  views: number;
  createdAt: string;
}

// 创建数据
export async function createData(req: VercelRequest, res: VercelResponse) {
  try {
    const { title, content, type, password } = req.body;
    
    if (!title || !content || !password) {
      return res.status(400).json({ message: '标题、内容和密码为必填项' });
    }
    
    // 创建密码哈希和内容加密
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '|' + content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const passwordHash = Buffer.from(hashBuffer).toString('base64');
    const encryptedContent = btoa(content);
    
    // 创建LeanCloud对象
    const Data = AV.Object.extend('Data');
    const dataObj = new Data();
    
    dataObj.set('title', title);
    dataObj.set('content', encryptedContent);
    dataObj.set('passwordHash', passwordHash);
    dataObj.set('type', type || 'text');
    dataObj.set('views', 0);
    
    await dataObj.save();
    
    return res.status(200).json({
      id: dataObj.id,
      message: '数据创建成功'
    });
  } catch (error) {
    console.error('创建数据失败:', error);
    return res.status(500).json({ message: '创建数据失败，请稍后再试' });
  }
}

// 获取数据
export async function getData(req: VercelRequest, res: VercelResponse) {
  try {
    const { id, password } = req.body;
    
    if (!id || !password) {
      return res.status(400).json({ message: '数据ID和密码为必填项' });
    }
    
    // 查询数据
    const query = new AV.Query('Data');
    const dataObj = await query.get(id);
    
    // 验证密码
    const encryptedContent = dataObj.get('content');
    const passwordHash = dataObj.get('passwordHash');
    const content = atob(encryptedContent);
    
    // 验证密码
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '|' + content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const verifyHash = Buffer.from(hashBuffer).toString('base64');
    
    if (verifyHash !== passwordHash) {
      return res.status(403).json({ message: '密码错误，无法访问数据' });
    }
    
    // 更新访问次数
    dataObj.increment('views', 1);
    await dataObj.save();
    
    return res.status(200).json({
      id: dataObj.id,
      title: dataObj.get('title'),
      content: content,
      type: dataObj.get('type'),
      views: dataObj.get('views'),
      createdAt: dataObj.get('createdAt').toISOString()
    });
  } catch (error) {
    console.error('获取数据失败:', error);
    return res.status(404).json({ message: '数据不存在或已被删除' });
  }
}

// 更新数据
export async function updateData(req: VercelRequest, res: VercelResponse) {
  try {
    const { id, title, content, type, currentPassword, newPassword } = req.body;
    
    if (!id || !title || !content || !currentPassword) {
      return res.status(400).json({ message: 'ID、标题、内容和当前密码为必填项' });
    }
    
    // 查询数据
    const query = new AV.Query('Data');
    const dataObj = await query.get(id);
    
    // 验证当前密码
    const encryptedContent = dataObj.get('content');
    const passwordHash = dataObj.get('passwordHash');
    const originalContent = atob(encryptedContent);
    
    const encoder = new TextEncoder();
    const verifyData = encoder.encode(currentPassword + '|' + originalContent);
    const verifyHashBuffer = await crypto.subtle.digest('SHA-256', verifyData);
    const verifyHash = Buffer.from(verifyHashBuffer).toString('base64');
    
    if (verifyHash !== passwordHash) {
      return res.status(403).json({ message: '当前密码错误，无法更新数据' });
    }
    
    // 确定使用的密码（新密码或现有密码）
    const passwordToUse = newPassword || currentPassword;
    
    // 加密新内容
    const newData = encoder.encode(passwordToUse + '|' + content);
    const newHashBuffer = await crypto.subtle.digest('SHA-256', newData);
    const newPasswordHash = Buffer.from(newHashBuffer).toString('base64');
    const newEncryptedContent = btoa(content);
    
    // 更新数据
    dataObj.set('title', title);
    dataObj.set('content', newEncryptedContent);
    dataObj.set('passwordHash', newPasswordHash);
    dataObj.set('type', type || 'text');
    
    await dataObj.save();
    
    return res.status(200).json({
      id: dataObj.id,
      message: '数据更新成功'
    });
  } catch (error) {
    console.error('更新数据失败:', error);
    return res.status(404).json({ message: '数据不存在或已被删除' });
  }
}

// 删除数据
export async function deleteData(req: VercelRequest, res: VercelResponse) {
  try {
    const { id, password } = req.body;
    
    if (!id || !password) {
      return res.status(400).json({ message: '数据ID和密码为必填项' });
    }
    
    // 查询数据
    const query = new AV.Query('Data');
    const dataObj = await query.get(id);
    
    // 验证密码
    const encryptedContent = dataObj.get('content');
    const passwordHash = dataObj.get('passwordHash');
    const content = atob(encryptedContent);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '|' + content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const verifyHash = Buffer.from(hashBuffer).toString('base64');
    
    if (verifyHash !== passwordHash) {
      return res.status(403).json({ message: '密码错误，无法删除数据' });
    }
    
    // 删除数据
    await dataObj.destroy();
    
    return res.status(200).json({ message: '数据删除成功' });
  } catch (error) {
    console.error('删除数据失败:', error);
    return res.status(404).json({ message: '数据不存在或已被删除' });
  }
}

// 主API处理函数
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 根据路径分发请求
  switch (req.url) {
    case '/api/create':
      return createData(req, res);
    case '/api/get':
      return getData(req, res);
    case '/api/update':
      return updateData(req, res);
    case '/api/delete':
      return deleteData(req, res);
    default:
      return res.status(404).json({ message: 'API端点不存在' });
  }
}
    