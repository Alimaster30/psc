# Prime Skin Clinic - Render Deployment Guide

## 🚀 Deploying to Render

This guide will help you deploy your Prime Skin Clinic application to Render with both frontend and backend services.

### Prerequisites

1. ✅ GitHub repository: https://github.com/Alimaster30/psc
2. ✅ MongoDB Atlas database configured
3. ✅ Render account (free tier available)

### Deployment Steps

#### Step 1: Deploy Backend API

1. **Go to Render Dashboard**
   - Visit: https://render.com
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Alimaster30/psc`
   - Choose "Deploy from a Git repository"

3. **Configure Backend Service**
   ```
   Name: prime-skin-clinic-api
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Root Directory: server
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://alit169533:Tahir123@cluster0.hmljfup.mongodb.net/pakskincare?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your_secure_jwt_secret_here_32_chars_min
   JWT_EXPIRES_IN=7d
   ENCRYPTION_KEY=12345678901234567890123456789012
   ```

5. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://prime-skin-clinic-api.onrender.com`

#### Step 2: Deploy Frontend

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect same repository: `Alimaster30/psc`

2. **Configure Frontend Service**
   ```
   Name: prime-skin-clinic-frontend
   Branch: main
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://prime-skin-clinic-api.onrender.com/api
   ```

4. **Deploy Frontend**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note your frontend URL: `https://prime-skin-clinic-frontend.onrender.com`

### Step 3: Update CORS Configuration

After deployment, update your backend CORS settings to allow your frontend domain.

### Step 4: Seed Database (Optional)

Once backend is deployed, you can seed your database:
1. Go to your backend service logs
2. Use the web service shell to run: `npm run seed:central`

### 🔗 Final URLs

- **Frontend**: https://prime-skin-clinic-frontend.onrender.com
- **Backend API**: https://prime-skin-clinic-api.onrender.com
- **Health Check**: https://prime-skin-clinic-api.onrender.com/api/health

### 🔐 Default Login Credentials

- **Admin**: admin@psc.com / Admin123!
- **Doctor**: doctor@psc.com / Doctor123!
- **Receptionist**: receptionist@psc.com / Reception123!

### 📝 Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep may take 30+ seconds
   - 750 hours/month limit

2. **Database**:
   - Already configured with MongoDB Atlas
   - No additional setup required

3. **SSL/HTTPS**:
   - Automatically provided by Render
   - No additional configuration needed

### 🛠️ Troubleshooting

- **Build Fails**: Check build logs for missing dependencies
- **Service Won't Start**: Verify environment variables
- **CORS Errors**: Update CORS_ORIGIN in backend environment
- **Database Connection**: Verify MongoDB Atlas connection string

### 🔄 Auto-Deploy

Both services are configured for auto-deploy from the main branch. Push changes to GitHub to trigger automatic deployments.
