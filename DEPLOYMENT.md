# 🚀 Deployment Guide - Evolution API SAAS Platform

This guide will help you deploy the Evolution API SAAS platform to production.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Evolution API server running
- MongoDB instance (or use Docker)

## 🏗 Local Development Setup

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd evolution-api-saas

# Make startup script executable
chmod +x start.sh

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the platform
./start.sh
```

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Start MongoDB (if not using Docker)
mongod

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Check Status**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

### Custom Docker Build

1. **Build Images**
   ```bash
   # Build backend
   docker build -t evolution-api-backend ./backend

   # Build frontend
   docker build -t evolution-api-frontend ./frontend
   ```

2. **Run Containers**
   ```bash
   # Run MongoDB
   docker run -d --name mongodb -p 27017:27017 mongo:7

   # Run backend
   docker run -d --name backend -p 5000:5000 --link mongodb evolution-api-backend

   # Run frontend
   docker run -d --name frontend -p 3000:3000 --link backend evolution-api-frontend
   ```

## ☁️ Cloud Deployment

### AWS Deployment

1. **EC2 Instance Setup**
   ```bash
   # Launch EC2 instance (Ubuntu 20.04+)
   # Install Docker
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

2. **Configure Security Groups**
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 3000 (Frontend - optional)
   - Port 5000 (Backend - optional)

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd evolution-api-saas

   # Configure environment
   cp .env.example .env
   nano .env

   # Start services
   docker-compose up -d
   ```

### DigitalOcean Deployment

1. **Create Droplet**
   - Ubuntu 20.04+
   - 2GB RAM minimum
   - 50GB SSD

2. **Install Dependencies**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy Application**
   ```bash
   git clone <repository-url>
   cd evolution-api-saas
   cp .env.example .env
   nano .env
   docker-compose up -d
   ```

### Google Cloud Platform

1. **Create VM Instance**
   ```bash
   gcloud compute instances create evolution-api \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-medium \
     --zone=us-central1-a
   ```

2. **Install Docker**
   ```bash
   gcloud compute ssh evolution-api
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Deploy Application**
   ```bash
   git clone <repository-url>
   cd evolution-api-saas
   cp .env.example .env
   nano .env
   docker-compose up -d
   ```

## 🔒 SSL/HTTPS Configuration

### Let's Encrypt (Free SSL)

1. **Install Certbot**
   ```bash
   sudo apt install certbot
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Update nginx.conf**
   ```bash
   # Copy SSL certificates to container
   docker cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem evolution-api-nginx:/etc/nginx/ssl/cert.pem
   docker cp /etc/letsencrypt/live/yourdomain.com/privkey.pem evolution-api-nginx:/etc/nginx/ssl/key.pem
   ```

4. **Enable HTTPS in nginx.conf**
   - Uncomment the HTTPS server block
   - Update domain name
   - Restart nginx container

### Cloudflare SSL

1. **Add Domain to Cloudflare**
2. **Update DNS Records**
   - A record pointing to your server IP
3. **Enable SSL/TLS**
   - Set to "Full (strict)" mode
4. **Update nginx.conf**
   - Use Cloudflare IPs for real IP forwarding

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Sign up at mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

2. **Configure Environment**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/evolution-api-saas?retryWrites=true&w=majority
   ```

### Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install mongodb-org
   ```

2. **Configure MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## 🔧 Production Configuration

### Environment Variables

```env
# Production Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb://username:password@host:port/database

# JWT (Use strong secret)
JWT_SECRET=your-very-strong-jwt-secret-key
JWT_EXPIRE=7d

# Evolution API
EVOLUTION_API_URL=https://your-evolution-api-server.com
EVOLUTION_API_KEY=your-production-api-key

# Frontend
FRONTEND_URL=https://yourdomain.com

# Email (Optional)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### Security Considerations

1. **Firewall Configuration**
   ```bash
   # UFW (Ubuntu)
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Docker Security**
   ```bash
   # Run containers as non-root
   # Use secrets for sensitive data
   # Regular security updates
   ```

3. **Application Security**
   - Strong JWT secrets
   - Rate limiting enabled
   - Input validation
   - CORS properly configured

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   # Check application health
   curl http://localhost:5000/api/health
   curl http://localhost:3000/api/health
   ```

2. **Log Monitoring**
   ```bash
   # View logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

3. **Resource Monitoring**
   ```bash
   # Monitor resource usage
   docker stats
   ```

### External Monitoring

1. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Error Tracking**
   - Sentry
   - Bugsnag
   - Rollbar

## 🔄 Backup & Recovery

### Database Backup

1. **MongoDB Backup**
   ```bash
   # Create backup
   mongodump --uri="mongodb://username:password@host:port/database" --out=backup/

   # Restore backup
   mongorestore --uri="mongodb://username:password@host:port/database" backup/database/
   ```

2. **Automated Backup**
   ```bash
   # Create backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   mongodump --uri="$MONGODB_URI" --out="backup_$DATE"
   ```

### Application Backup

1. **Configuration Backup**
   ```bash
   # Backup environment files
   cp .env .env.backup
   cp docker-compose.yml docker-compose.yml.backup
   ```

2. **Code Backup**
   ```bash
   # Git repository backup
   git remote add backup https://github.com/username/backup-repo.git
   git push backup main
   ```

## 🚀 Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use nginx or HAProxy
   - Multiple backend instances
   - Session stickiness for Socket.IO

2. **Database Scaling**
   - MongoDB replica sets
   - Read replicas
   - Sharding for large datasets

### Vertical Scaling

1. **Resource Increase**
   - More CPU/RAM for containers
   - SSD storage for database
   - CDN for static assets

## 🔧 Maintenance

### Regular Updates

1. **Security Updates**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade

   # Update Docker images
   docker-compose pull
   docker-compose up -d
   ```

2. **Application Updates**
   ```bash
   # Pull latest code
   git pull origin main

   # Rebuild and restart
   docker-compose down
   docker-compose up -d --build
   ```

### Performance Optimization

1. **Database Optimization**
   - Index optimization
   - Query optimization
   - Connection pooling

2. **Application Optimization**
   - Caching strategies
   - CDN implementation
   - Image optimization

## 📞 Support

For deployment support:
- Check logs: `docker-compose logs -f`
- Verify configuration: `.env` file
- Test connectivity: `curl` commands
- Review documentation: README.md

## 🎯 Production Checklist

- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Database secured
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Security headers enabled
- [ ] Rate limiting configured

---

🎉 Your Evolution API SAAS platform is now ready for production!