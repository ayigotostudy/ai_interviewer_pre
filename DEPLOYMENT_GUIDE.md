# Easy Offer 部署指南

## 🚀 部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 部署文件结构
确保您的服务器文件结构如下：
```
/usr/share/nginx/html/
├── dist/
│   ├── index.html
│   ├── assets/
│   │   ├── main-BaR8q7fz.js
│   │   ├── main-BxYEvGKn.css
│   │   └── ... (其他资源文件)
│   ├── offer.png
│   └── favicon.ico
└── nginx.conf
```

### 3. Nginx配置
使用提供的 `nginx.conf` 文件，确保：
- 静态资源路径正确
- MIME类型设置正确
- Vue Router history模式支持

### 4. 重启Nginx
```bash
sudo nginx -t  # 测试配置
sudo nginx -s reload  # 重新加载配置
```

## 🔧 常见问题解决

### 问题1: 页面空白，控制台显示MIME类型错误
**错误信息**: `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**解决方案**:
1. 检查文件路径是否正确
2. 确保Nginx配置中的静态资源处理正确
3. 检查文件权限

### 问题2: 静态资源404
**解决方案**:
1. 确保 `dist/` 目录完整上传
2. 检查Nginx配置中的路径匹配
3. 验证文件权限

### 问题3: 路由刷新404
**解决方案**:
1. 确保Nginx配置中有 `try_files` 指令
2. 检查Vue Router的base路径配置

## 📁 文件上传命令示例

### 使用scp上传
```bash
# 上传dist目录
scp -r dist/ user@server:/usr/share/nginx/html/

# 上传nginx配置
scp nginx.conf user@server:/etc/nginx/conf.d/default.conf
```

### 使用rsync上传
```bash
# 同步dist目录
rsync -avz dist/ user@server:/usr/share/nginx/html/dist/
```

## 🌐 访问地址

部署完成后，访问：
- 主应用: `http://your-domain/dist/`
- 如果部署在根目录: `http://your-domain/`

## 🔍 调试步骤

1. **检查文件是否存在**:
   ```bash
   ls -la /usr/share/nginx/html/dist/assets/
   ```

2. **检查Nginx配置**:
   ```bash
   sudo nginx -t
   ```

3. **查看Nginx错误日志**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. **查看访问日志**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

## 📝 注意事项

1. 确保后端API服务正在运行
2. 检查防火墙设置
3. 确保域名解析正确
4. 定期备份配置文件

