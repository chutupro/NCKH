# Deployment Guide - NestJS Historical Archive API

## Prerequisites

- Node.js 18+ installed
- SQL Server 2019+ installed and running
- npm or yarn package manager
- Git (for version control)

## Step 1: Clone or Setup Project

```bash
# If using git
git clone <your-repository>
cd nestjs-historical-archive-api

# Or create new project
# Project files are already created
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- NestJS framework
- TypeORM & SQL Server driver
- Passport & JWT for authentication
- Class-validator for validation
- Swagger for API documentation
- Multer for file uploads
- And all development dependencies

## Step 3: Database Setup

### Create Database

```sql
CREATE DATABASE HistoricalArchive;
GO

USE HistoricalArchive;
GO
```

### Create Tables (Run in order)

```sql
-- 1. Roles table (no dependencies)
CREATE TABLE [dbo].[Roles] (
    [RoleID] [int] IDENTITY(1,1) NOT NULL,
    [RoleName] [varchar](50) NOT NULL,
    [Description] [varchar](200) NULL,
    PRIMARY KEY CLUSTERED ([RoleID] ASC)
);

-- 2. Users table (depends on Roles)
CREATE TABLE [dbo].[Users] (
    [UserID] [int] IDENTITY(1,1) NOT NULL,
    [Email] [varchar](255) NOT NULL UNIQUE,
    [PasswordHash] [varchar](255) NOT NULL,
    [FullName] [varchar](100) NOT NULL,
    [RoleID] [int] NOT NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([UserID] ASC),
    FOREIGN KEY ([RoleID]) REFERENCES [dbo].[Roles]([RoleID])
);

-- 3. Articles table (depends on Users)
CREATE TABLE [dbo].[Articles] (
    [ArticleID] [int] IDENTITY(1,1) NOT NULL,
    [UserID] [int] NOT NULL,
    [Title] [varchar](200) NOT NULL,
    [Content] [varchar](max) NOT NULL,
    [Language] [varchar](10) NOT NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([ArticleID] ASC),
    FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID])
);

-- Continue with remaining tables...
-- (Use the SQL scripts from your original requirements)
```

### Seed Initial Data

```sql
-- Insert default roles
INSERT INTO [dbo].[Roles] ([RoleName], [Description]) VALUES 
('Admin', 'Full system access'),
('Moderator', 'Content moderation access'),
('User', 'Standard user access');
```

## Step 4: Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy from example
cp .env.example .env
```

Update with your values:

```env
# Database Configuration
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
DB_DATABASE=HistoricalArchive
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-production-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-production-refresh-secret-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# Application Configuration
PORT=3000
NODE_ENV=production

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Step 5: Create Upload Directory

```bash
mkdir uploads
```

On Linux/Mac:
```bash
chmod 755 uploads
```

## Step 6: Build Application

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` folder.

## Step 7: Run Tests (Optional but Recommended)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Step 8: Start Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run start:prod
```

### Using PM2 (Recommended for Production)

Install PM2:
```bash
npm install -g pm2
```

Start with PM2:
```bash
pm2 start dist/main.js --name "historical-archive-api"
pm2 save
pm2 startup
```

Monitor:
```bash
pm2 status
pm2 logs historical-archive-api
pm2 monit
```

## Step 9: Verify Installation

1. **Check Health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Access Swagger**:
   Open browser: `http://localhost:3000/api/docs`

3. **Test Registration**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123456",
       "fullName": "System Administrator"
     }'
   ```

4. **Update First User Role** (Make them Admin):
   ```sql
   UPDATE Users SET RoleID = 1 WHERE Email = 'admin@example.com';
   ```

## Step 10: Production Considerations

### Security

1. **HTTPS**: Configure reverse proxy (Nginx/Apache) with SSL
2. **CORS**: Update CORS settings in `main.ts`
3. **Rate Limiting**: Add rate limiting middleware
4. **Helmet**: Add Helmet.js for security headers

```bash
npm install @nestjs/throttler helmet
```

### Database

1. **Connection Pool**: Configure TypeORM connection pool
2. **Backups**: Set up automated backups
3. **Indexes**: Add indexes for performance
4. **Migrations**: Use TypeORM migrations for schema changes

### Monitoring

1. **Logging**: Integrate Winston or Pino
   ```bash
   npm install nest-winston winston
   ```

2. **Application Monitoring**: Use PM2 or New Relic
3. **Error Tracking**: Integrate Sentry
4. **Health Checks**: Implement health check endpoint

### Performance

1. **Caching**: Add Redis for caching
   ```bash
   npm install @nestjs/cache-manager cache-manager
   ```

2. **Compression**: Enable gzip compression
   ```bash
   npm install compression
   ```

3. **CDN**: Use CDN for uploaded images

## Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
```

Run:
```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
- Check SQL Server is running
- Verify credentials in `.env`
- Check SQL Server allows TCP/IP connections
- Verify port 1433 is accessible

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000
# Kill process
kill -9 <PID>
```

### Upload Directory Permissions
```bash
chmod -R 755 uploads
chown -R node:node uploads
```

### TypeORM Synchronize Warning
In production, set `synchronize: false` in database config and use migrations.

## Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Backup Database
```bash
# Using SQL Server Management Studio
# Or command line:
sqlcmd -S localhost -U sa -P password -Q "BACKUP DATABASE HistoricalArchive TO DISK='C:\Backups\HistoricalArchive.bak'"
```

### Monitor Logs
```bash
pm2 logs
# Or check application logs
tail -f logs/application.log
```

### Clear Uploads (if needed)
```bash
rm -rf uploads/*
mkdir uploads
```

## Support

For issues:
1. Check logs: `pm2 logs` or application logs
2. Verify environment variables
3. Check database connections
4. Review Swagger documentation at `/api/docs`

---

**Ready for Production!**  
Your NestJS Historical Archive API is now deployed and running.

