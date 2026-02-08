FROM nginx:1.26.0

# Set timezone (optional)
RUN ln -sf /usr/share/zoneinfo/Asia/Riyadh /etc/localtime

# Copy React build output
COPY build /home/react/app

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
