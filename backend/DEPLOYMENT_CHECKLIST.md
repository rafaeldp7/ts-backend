# Deployment Checklist - TrafficSlight Admin Dashboard Backend

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Database connection string configured
- [ ] JWT secret key set
- [ ] Google Maps API key configured
- [ ] CORS origins configured
- [ ] Email service configured (if using)
- [ ] File upload settings configured
- [ ] Redis configuration (if using caching)

### 2. Database Setup
- [ ] Database created and accessible
- [ ] Database indexes created for performance
- [ ] Database connection pooling configured
- [ ] Database backup strategy implemented
- [ ] Database migration scripts ready (if needed)

### 3. Security Configuration
- [ ] HTTPS/SSL certificate installed
- [ ] Security headers configured (helmet.js)
- [ ] Rate limiting implemented
- [ ] Input validation middleware
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CORS properly configured
- [ ] JWT token expiration set
- [ ] Password hashing implemented

### 4. Performance Optimization
- [ ] Database connection pooling
- [ ] Query optimization
- [ ] Caching strategy implemented
- [ ] CDN for static files (if applicable)
- [ ] Compression middleware
- [ ] Image optimization (if applicable)
- [ ] API response optimization

### 5. Monitoring & Logging
- [ ] Application logging configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Health check endpoints
- [ ] Database monitoring
- [ ] Server monitoring
- [ ] Alert system configured

### 6. API Documentation
- [ ] API documentation updated
- [ ] Endpoint testing completed
- [ ] Postman collection created
- [ ] API versioning strategy
- [ ] Rate limiting documentation

### 7. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] API endpoint tests
- [ ] Load testing completed
- [ ] Security testing completed
- [ ] Cross-browser testing (if applicable)

### 8. Deployment Configuration
- [ ] Production environment variables set
- [ ] Server configuration optimized
- [ ] Process management (PM2, etc.)
- [ ] Auto-restart on failure
- [ ] Log rotation configured
- [ ] Backup strategy implemented

## Production Deployment Steps

### 1. Server Setup
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/trafficslight-backend
sudo chown $USER:$USER /var/www/trafficslight-backend
```

### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url> /var/www/trafficslight-backend
cd /var/www/trafficslight-backend

# Install dependencies
npm install --production

# Set environment variables
cp .env.example .env
# Edit .env with production values

# Build application (if needed)
npm run build
```

### 3. Database Configuration
```bash
# Create database user
sudo -u postgres createuser trafficslight_user
sudo -u postgres createdb trafficslight_db
sudo -u postgres psql -c "ALTER USER trafficslight_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE trafficslight_db TO trafficslight_user;"

# Run database migrations (if needed)
npm run migrate
```

### 4. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Nginx Configuration
```nginx
# /etc/nginx/sites-available/trafficslight-backend
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
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

### 6. PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'trafficslight-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 7. Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 8. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Post-Deployment Checklist

### 1. Health Checks
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email sending working (if applicable)

### 2. Performance Verification
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] Memory usage stable
- [ ] CPU usage normal
- [ ] Disk space sufficient

### 3. Security Verification
- [ ] HTTPS working
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] Authentication secure

### 4. Monitoring Setup
- [ ] Application logs working
- [ ] Error tracking working
- [ ] Performance monitoring active
- [ ] Alerts configured
- [ ] Backup system working

### 5. Documentation
- [ ] API documentation updated
- [ ] Deployment guide updated
- [ ] Troubleshooting guide created
- [ ] Contact information updated

## Maintenance Tasks

### Daily
- [ ] Check application logs
- [ ] Monitor server resources
- [ ] Verify backups
- [ ] Check error rates

### Weekly
- [ ] Review performance metrics
- [ ] Check security logs
- [ ] Update dependencies
- [ ] Test backup restoration

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database maintenance
- [ ] SSL certificate renewal check

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs trafficslight-backend

# Restart application
pm2 restart trafficslight-backend
```

#### 2. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U trafficslight_user -d trafficslight_db
```

#### 3. High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart trafficslight-backend
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### Emergency Procedures

#### 1. Application Down
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart trafficslight-backend

# If PM2 is not running
pm2 start ecosystem.config.js
```

#### 2. Database Issues
```bash
# Check database status
sudo systemctl status postgresql

# Restart database
sudo systemctl restart postgresql
```

#### 3. Server Issues
```bash
# Check server resources
htop

# Check disk space
df -h

# Check memory
free -h
```

## Backup Strategy

### 1. Database Backups
```bash
# Create backup script
#!/bin/bash
pg_dump -h localhost -U trafficslight_user trafficslight_db > /backups/db_$(date +%Y%m%d_%H%M%S).sql

# Schedule daily backups
0 2 * * * /path/to/backup_script.sh
```

### 2. Application Backups
```bash
# Backup application files
tar -czf /backups/app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/trafficslight-backend
```

### 3. Configuration Backups
```bash
# Backup configuration files
cp /etc/nginx/sites-available/trafficslight-backend /backups/
cp /var/www/trafficslight-backend/.env /backups/
```

This deployment checklist ensures a smooth and secure deployment of the TrafficSlight Admin Dashboard backend.
