# 使用Nginx作为静态文件服务器
FROM nginx:alpine

# 复制打包后的文件到nginx目录
COPY dist/ /usr/share/nginx/html/

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
