# How to Use the Socket Server

You now have **two deployment options** for your socket server:

## 🚀 Option 1: Vercel Deployment (Serverless)

### Quick Start
1. **Install dependencies:**
```bash
npm install
```

2. **Deploy to Vercel:**
```bash
npm run deploy
```

3. **Test locally with Vercel dev server (Port 5050):**
```bash
npm run vercel-dev
```
This starts the Vercel dev server at `http://localhost:5050`

**Alternative: Use port 3000:**
```bash
npm run vercel-dev-3000
```

### Client Connection (Vercel)
```javascript
import { io } from 'socket.io-client';

// For local Vercel development (port 5050)
const socket = io('http://localhost:5050', {
  path: '/api/socket',
  transports: ['websocket', 'polling']
});

// For production
const socket = io('https://your-app.vercel.app', {
  path: '/api/socket',
  transports: ['websocket', 'polling']
});

// Join a note room
socket.emit('join-note', {
  noteId: 'my-note-123',
  userInfo: { email: 'user@example.com' }
});

// Listen for events
socket.on('cursor-moved', (data) => {
  console.log('Cursor moved:', data);
});
```

---

## 🖥️ Option 2: Traditional Server (Port 5050)

### Quick Start
1. **Install dependencies:**
```bash
npm install
```

2. **Start the traditional server:**
```bash
npm start
```
This starts the server at `http://localhost:5050`

3. **For development with auto-restart:**
```bash
npm run dev
```

### Client Connection (Traditional)
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5050');

// Same events as Vercel version
socket.emit('join-note', {
  noteId: 'my-note-123',
  userInfo: { email: 'user@example.com' }
});
```

---

## 🧪 Testing Both Versions

### Using the Test Client
1. **Open `client-example.html` in your browser**

2. **For Vercel testing:**
   - Server URL: `http://localhost:5050` (Vercel dev) or `https://your-app.vercel.app` (production)
   - The client automatically uses the correct path `/api/socket`

3. **For Traditional server testing:**
   - Server URL: `http://localhost:5050`
   - The client connects directly to the root path

**Note:** Both Vercel dev and traditional server now use port 5050 for consistency!

### Test Steps
1. Enter your server URL (`http://localhost:5050` for local testing)
2. Set your email and note ID
3. Click "Connect"
4. Click "Join Note"
5. Test cursor updates, text changes, and selections
6. Open multiple browser tabs to test real-time collaboration

---

## 📊 Monitoring & Logs

Both versions include detailed logging:

```
[CONNECTION] User connected: abc123 at 2024-01-15T10:30:00.000Z
[JOIN REQUEST] User abc123 requesting to join note note-456
[CURSOR UPDATE] User abc123 (user@example.com) in note note-456: { position: 100, selection: {...} }
[TEXT CHANGE] User abc123 (user@example.com) in note note-456: { operations: '3 operations', version: 1 }
```

### Vercel Logs
- View logs in Vercel dashboard
- Use `vercel logs` command
- Monitor function execution time

### Traditional Server Logs
- Logs appear in your terminal
- Use process managers like PM2 for production
- Set up log rotation for long-running servers

---

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# For custom ports (traditional server only)
PORT=5050

# For CORS origins
CORS_ORIGIN=https://yourdomain.com
```

### Vercel Environment Variables
Set in Vercel dashboard or `.env.local`:
```bash
NODE_ENV=production
```

---

## 🌐 Production Deployment

### Vercel (Recommended for Serverless)
```bash
# One-time setup
vercel login
vercel link

# Deploy
npm run deploy

# Custom domain
vercel domains add yourdomain.com
```

### Traditional Server (VPS/Cloud)
```bash
# Using PM2
npm install -g pm2
pm2 start socket-server.js --name "socket-server"
pm2 startup
pm2 save

# Using Docker
docker build -t socket-server .
docker run -p 5050:5050 socket-server
```

---

## 🔄 Switching Between Versions

### To use Vercel version:
- Use `npm run vercel-dev` for development
- Deploy with `npm run deploy`
- Connect clients to `/api/socket` path

### To use Traditional version:
- Use `npm start` or `npm run dev`
- Deploy to your own server
- Connect clients directly to root path

---

## 🚨 Troubleshooting

### Common Issues

**1. "require is not defined" error:**
- ✅ Fixed! All files now use ES modules

**2. Connection fails on Vercel:**
- Check the path: `/api/socket`
- Verify CORS settings
- Test with polling transport first

**3. Traditional server won't start:**
- Check if port 5050 is available
- Verify Node.js version (18+)
- Check firewall settings

**4. Real-time features not working:**
- Verify both clients joined the same note ID
- Check browser console for errors
- Monitor server logs for connection issues

### Debug Mode
Add debug logging:
```javascript
const socket = io(serverUrl, {
  path: '/api/socket', // for Vercel
  transports: ['websocket', 'polling'],
  debug: true
});
```

---

## 📈 Scaling Considerations

### Vercel (Serverless)
- ✅ Auto-scaling
- ✅ Global edge network
- ⚠️ Cold starts
- ⚠️ Memory resets between invocations

### Traditional Server
- ✅ Persistent connections
- ✅ Full control over resources
- ⚠️ Manual scaling required
- ⚠️ Single point of failure

### For High Traffic
Consider adding:
- Redis adapter for multi-instance support
- Database for persistent room state
- Load balancer with sticky sessions 