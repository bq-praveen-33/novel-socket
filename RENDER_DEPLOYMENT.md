# Deploy to Render

## 🚀 Why Render for Socket.IO?

✅ **Native WebSocket Support** - No transport limitations  
✅ **Persistent Connections** - Better for real-time apps  
✅ **Free Tier Available** - Great for testing  
✅ **Easy Deployment** - Git-based auto-deploy  
✅ **Environment Variables** - Simple configuration  

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)

## 🔧 Deployment Steps

### Step 1: Prepare Your Repository

Your repository is already configured with:
- ✅ `render.yaml` - Render configuration
- ✅ `socket-server.js` - Updated for production
- ✅ `package.json` - Correct start script
- ✅ Environment variable support

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `bq-praveen-33/novel-socket`

3. **Configure Service:**
   - **Name**: `notion-socket-server`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Environment Variables (Optional):**
   ```
   NODE_ENV=production
   ```

5. **Click "Create Web Service"**

### Step 3: Update CORS Origins

Once deployed, update the CORS origins in `socket-server.js`:

```javascript
origin: process.env.NODE_ENV === 'production' 
  ? [
      "https://your-actual-frontend-domain.com",
      "https://your-frontend.vercel.app",
      "https://localhost:3000",
      "http://localhost:3000"
    ]
  : "*"
```

## 🧪 Testing Your Render Deployment

### 1. Get Your Render URL
After deployment, you'll get a URL like:
`https://notion-socket-server.onrender.com`

### 2. Test Health Check
Visit: `https://notion-socket-server.onrender.com/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Test Socket.IO Connection
Update your client code:

```javascript
const socket = io('https://notion-socket-server.onrender.com', {
  transports: ['websocket', 'polling'], // WebSocket works on Render!
  timeout: 20000
});
```

### 4. Test Real-time Features
- ✅ User connections
- ✅ Room joining
- ✅ Cursor updates
- ✅ Text changes
- ✅ Selection updates

## 📊 Render vs Vercel Comparison

| Feature | Render | Vercel |
|---------|--------|--------|
| **WebSocket Support** | ✅ Native | ⚠️ Limited |
| **Persistent Connections** | ✅ Yes | ❌ Serverless |
| **Real-time Apps** | ✅ Excellent | ⚠️ Workarounds needed |
| **Free Tier** | ✅ 750 hours/month | ✅ Limited functions |
| **Scaling** | ✅ Vertical/Horizontal | ✅ Auto-serverless |

## 🔍 Monitoring

### Render Dashboard:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Health**: Service status and uptime

### Check Your Logs:
Look for these messages:
```
> Socket.IO server ready on http://0.0.0.0:10000
[CONNECTION] User connected: abc123 at 2024-01-15T10:30:00.000Z
[CURSOR UPDATE] User abc123 (user@example.com) in note note-456
```

## 🚨 Troubleshooting

### Service Won't Start:
- Check build logs in Render dashboard
- Verify `npm start` command works locally
- Ensure `package.json` has correct main script

### CORS Issues:
- Add your frontend domain to CORS origins
- Check browser network tab for CORS errors
- Test with `"*"` temporarily

### WebSocket Connection Fails:
- Verify the correct Render URL
- Check firewall/proxy settings
- Monitor Render logs for connection attempts

## 💡 Production Tips

1. **Custom Domain**: Add your own domain in Render dashboard
2. **Environment Variables**: Store sensitive config in Render env vars
3. **Health Checks**: Use the `/health` endpoint for monitoring
4. **Scaling**: Upgrade to paid plan for better performance
5. **SSL**: Render provides free SSL certificates

## 🔄 Auto-Deployment

Render automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update: Your changes"
git push origin main
```

Render will:
1. Detect the push
2. Run build command
3. Deploy new version
4. Update live service

Your Socket.IO server with detailed logging is now ready for production on Render! 🎉 