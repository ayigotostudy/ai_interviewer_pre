# Easy Offer 部署指南

## 部署架构

```
用户请求 → Nginx (端口80) → 前端静态文件
                    ↓
                后端API代理 → 后端服务 (端口8080)
```

## 配置说明

### 1. Nginx 配置

Nginx 配置了以下功能：
- **静态文件服务**：提供前端 Vue 应用
- **API 代理**：将 `/api/` 请求代理到后端服务
- **路由支持**：支持 Vue Router 的 history 模式
- **静态资源缓存**：优化加载性能
- **Gzip 压缩**：减少传输大小

### 2. 后端连接配置

根据你的部署方式，需要修改 `nginx.conf` 中的后端地址：

#### 方式一：Docker Compose 部署（推荐）
```nginx
proxy_pass http://backend:8080/;
```

#### 方式二：同一台机器部署
```nginx
proxy_pass http://127.0.0.1:8080/;
```

#### 方式三：不同机器部署
```nginx
proxy_pass http://your-backend-server-ip:8080/;
```

### 3. 部署步骤

#### 使用 Docker Compose（推荐）

1. **准备后端镜像**
   ```bash
   # 构建后端镜像
   docker build -t your-backend-image:latest ./backend
   ```

2. **修改 docker-compose.yml**
   ```yaml
   backend:
     image: your-backend-image:latest  # 替换为实际的后端镜像
   ```

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

#### 手动部署

1. **启动后端服务**
   ```bash
   # 确保后端服务在 8080 端口运行
   ./your-backend-service
   ```

2. **构建前端**
   ```bash
   npm run build
   ```

3. **启动 Nginx**
   ```bash
   docker build -t easy-offer-frontend .
   docker run -d -p 80:80 --name easy-offer-frontend easy-offer-frontend
   ```

### 4. 验证部署

1. **检查前端访问**
   ```bash
   curl http://your-server-ip/
   ```

2. **检查 API 代理**
   ```bash
   curl http://your-server-ip/api/health
   ```

3. **检查路由**
   ```bash
   curl http://your-server-ip/register
   curl http://your-server-ip/login
   ```

### 5. 常见问题

#### 问题1：404 错误
- 检查 Nginx 配置中的 `try_files` 设置
- 确认前端构建文件是否正确部署

#### 问题2：API 请求失败
- 检查后端服务是否正常运行
- 确认 Nginx 代理配置中的后端地址
- 检查防火墙设置

#### 问题3：路由不工作
- 确认 Vue Router 的 base 路径配置
- 检查 Nginx 的 location 配置

### 6. 环境变量

如果需要动态配置后端地址，可以使用环境变量：

```nginx
# 在 nginx.conf 中使用环境变量
proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT}/;
```

然后在 Docker 启动时设置：
```bash
docker run -e BACKEND_HOST=your-backend-ip -e BACKEND_PORT=8080 ...
```

### 7. 监控和日志

```bash
# 查看容器日志
docker-compose logs -f

# 查看 Nginx 访问日志
docker exec aijianli-frontend tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
docker exec aijianli-frontend tail -f /var/log/nginx/error.log
```
