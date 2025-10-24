# Traffic Management System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Traffic Management System backend to various environments.

## Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Redis (optional, for caching)
- SMTP server for email notifications
- Google Maps API key
- Domain name and SSL certificate

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd traffic-management-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_URI=mongodb://localhost:27017/traffic-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@trafficmanagement.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
```

## Database Setup

### 1. MongoDB Installation

#### Ubuntu/Debian:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### CentOS/RHEL:
```bash
sudo yum install -y mongodb-org
```

#### macOS:
```bash
brew install mongodb-community
```

### 2. Start MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Create Database and User

```bash
mongo
use traffic-management
db.createUser({
  user: "traffic_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

### 4. Update Database URI

Update your `.env` file:

```env
DB_URI=mongodb://traffic_user:secure_password@localhost:27017/traffic-management
```

## Application Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Start Application

#### Development:
```bash
npm run dev
```

#### Production:
```bash
npm start
```

### 3. Using PM2 (Recommended for Production)

Install PM2:
```bash
npm install -g pm2
```

Create PM2 ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'traffic-management-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx

Create configuration file:

```nginx
# /etc/nginx/sites-available/traffic-management
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/traffic-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL Configuration

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Create Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_URI=mongodb://mongo:27017/traffic-management
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

### 3. Deploy with Docker

```bash
docker-compose up -d
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

Launch EC2 instance with Ubuntu 20.04 LTS.

#### 2. Install Dependencies

```bash
sudo apt update
sudo apt install -y nodejs npm mongodb nginx
```

#### 3. Deploy Application

```bash
git clone <repository-url>
cd traffic-management-backend
npm install
npm run build
pm2 start ecosystem.config.js
```

#### 4. Configure Security Groups

- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 5000 (API - internal only)

### Google Cloud Platform

#### 1. Create VM Instance

```bash
gcloud compute instances create traffic-management \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-medium \
  --zone=us-central1-a
```

#### 2. Deploy Application

```bash
gcloud compute ssh traffic-management
# Follow deployment steps
```

### Azure Deployment

#### 1. Create App Service

```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name traffic-management-api \
  --runtime "NODE|16"
```

#### 2. Deploy Code

```bash
az webapp deployment source config \
  --resource-group myResourceGroup \
  --name traffic-management-api \
  --repo-url <repository-url> \
  --branch main \
  --manual-integration
```

## Monitoring and Logging

### 1. Application Monitoring

Install monitoring tools:

```bash
npm install -g pm2-logrotate
pm2 install pm2-logrotate
```

### 2. Log Management

Configure log rotation:

```bash
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 3. Health Checks

Create health check endpoint:

```javascript
// health.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(3001);
```

### 4. Monitoring with PM2

```bash
pm2 monit
```

## Security Configuration

### 1. Firewall Setup

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL/TLS Configuration

Update Nginx configuration for SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Rate Limiting

Configure rate limiting in Nginx:

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://localhost:5000;
        }
    }
}
```

## Backup and Recovery

### 1. Database Backup

Create backup script:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db traffic-management --out /backups/mongodb_$DATE
tar -czf /backups/mongodb_$DATE.tar.gz /backups/mongodb_$DATE
rm -rf /backups/mongodb_$DATE
```

### 2. Automated Backups

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

### 3. Application Backup

```bash
#!/bin/bash
# app-backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/app_$DATE.tar.gz /path/to/application
```

## Performance Optimization

### 1. Database Optimization

Create indexes:

```javascript
// indexes.js
const mongoose = require('mongoose');

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'address.city': 1 });
db.users.createIndex({ createdAt: -1 });

// Report indexes
db.reports.createIndex({ 'location.coordinates': '2dsphere' });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ reportedAt: -1 });

// Trip indexes
db.trips.createIndex({ user: 1 });
db.trips.createIndex({ startTime: -1 });
db.trips.createIndex({ 'startLocation.coordinates': '2dsphere' });
```

### 2. Caching

Install Redis:

```bash
sudo apt install redis-server
```

Configure Redis:

```javascript
// redis.js
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

module.exports = client;
```

### 3. Load Balancing

Configure Nginx load balancing:

```nginx
upstream api {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location / {
        proxy_pass http://api;
    }
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **PM2 process not starting**
   ```bash
   pm2 logs
   pm2 restart all
   ```

4. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Log Analysis

```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u mongod
```

## Maintenance

### 1. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js
sudo npm install -g n
sudo n stable

# Update application
git pull origin main
npm install
pm2 restart all
```

### 2. Database Maintenance

```bash
# Check database status
mongo --eval "db.stats()"

# Repair database
mongod --repair

# Compact database
mongo --eval "db.runCommand({compact: 'collection_name'})"
```

### 3. Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/traffic-management

# Add configuration
/var/log/traffic-management/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## Scaling

### 1. Horizontal Scaling

Add more application instances:

```bash
pm2 scale traffic-management-api 4
```

### 2. Database Scaling

Configure MongoDB replica set:

```bash
# Initialize replica set
mongo --eval "rs.initiate()"
```

### 3. Load Balancer

Configure HAProxy:

```bash
sudo apt install haproxy
```

Update configuration:

```
backend api
    balance roundrobin
    server api1 localhost:5000 check
    server api2 localhost:5001 check
    server api3 localhost:5002 check
```

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Traffic Management System backend. Follow the steps carefully and adapt them to your specific environment and requirements.

For additional support, refer to the documentation or contact the development team.
