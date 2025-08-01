# CloudVault - 安全文本数据存储服务

CloudVault 是一个简单、安全的临时文本数据存储解决方案，无需注册即可使用。通过密码保护您的重要文本信息，随时随地访问，所有数据均通过加密处理并安全存储在云端。

## 功能特点

- **密码保护**：每条数据都可设置独立密码，确保只有授权用户才能访问
- **无需注册**：无需创建账户或登录，直接使用服务，保护您的隐私
- **文本专属**：专注于文本数据存储，不支持文件上传，确保数据轻量高效
- **云端存储**：数据安全存储在云端，通过唯一ID和密码在任何设备上访问
- **隐私保护**：所有数据加密处理，第三方（包括服务提供商）无法查看您的内容

## 技术架构

- **前端**：基于HTML、Tailwind CSS和原生JavaScript构建的单页应用
- **后端**：TypeScript编写的API服务，部署在Vercel上
- **数据存储**：通过后端代理访问LeanCloud存储服务，保护API密钥安全
- **加密方式**：采用SHA-256哈希算法进行密码验证，文本内容Base64编码

## 部署指南

### 前提条件

- 一个LeanCloud账户和创建的应用（获取appId、appKey和serverURL）
- 一个Vercel账户（用于部署后端服务）
- Node.js环境（本地开发）

### 部署步骤

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/cloudvault.git
cd cloudvault
```

2. **配置环境变量**

复制`.env.example`为`.env`并填入您的LeanCloud信息：

```
# LeanCloud配置
LEANCLOUD_APP_ID=your_leancloud_app_id
LEANCLOUD_APP_KEY=your_leancloud_app_key
LEANCLOUD_SERVER_URL=your_leancloud_server_url
```

3. **部署到Vercel**

```bash
# 安装Vercel CLI（如果未安装）
npm i -g vercel

# 部署
vercel deploy
```

按照提示完成部署过程，Vercel将为您分配一个URL，您可以通过该URL访问应用。

## 使用方法

1. **添加新数据**
   - 点击"添加新数据"按钮
   - 输入标题、文本内容和数据类型
   - 设置密码（用于后续访问）
   - 点击"保存数据"，获取唯一数据ID

2. **访问已有数据**
   - 输入数据ID和对应密码
   - 点击"查看数据"按钮访问内容

3. **管理数据**
   - 查看数据时可以进行编辑或删除操作
   - 系统会记录最近访问的数据，方便快速访问

## 安全说明

- 所有数据在存储前都会经过加密处理
- 密码不会被存储，仅用于验证身份
- 数据ID是访问的唯一标识，请妥善保管
- 作为临时存储服务，建议对重要数据进行本地备份

## 许可证

本项目采用MIT许可证 - 详见LICENSE文件。
