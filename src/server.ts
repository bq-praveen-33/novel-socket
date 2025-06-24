import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: process.env.FRONTEND_URL||"http://localhost:3000",
  credentials: true
}));

// Configure Socket.IO with CORS
const io = new Server(server, {
  path: "/api/socket",
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage for notes data
const noteUsers: Record<string, Record<string, string>> = {};
const noteContents: Record<string, unknown> = {};
const noteCursors: Record<string, Record<string, { from: number; to: number; user: string }>> = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a note
  socket.on('join', (data: { noteId: string; email?: string }) => {
    console.log('User joining note:', data.noteId, 'Email:', data.email);
    
    socket.join(data.noteId);
    
    if (data.email) {
      const users = noteUsers[data.noteId] ?? (noteUsers[data.noteId] = {});
      users[socket.id] = data.email;
      io.to(data.noteId).emit('users', Object.values(users));
    }
    
    // Send existing content if available
    if (noteContents[data.noteId]) {
      socket.emit('update', noteContents[data.noteId]);
    }
    
    // Send existing cursors if available
    if (noteCursors[data.noteId]) {
      for (const cursor of Object.values(noteCursors[data.noteId]!)) {
        socket.emit('cursor', cursor);
      }
    }
  });

  // Handle content updates
  socket.on('update', (data: { noteId: string; content: unknown }) => {
    console.log('Content update for note:', data.noteId);
    
    noteContents[data.noteId] = data.content;
    socket.to(data.noteId).emit('update', data.content);
  });

  // Handle cursor updates
  socket.on('cursor', (data: { noteId: string; user: string; from: number; to: number }) => {
    console.log('Cursor update for note:', data.noteId, 'User:', data.user);
    
    const cursors = noteCursors[data.noteId] ?? (noteCursors[data.noteId] = {});
    cursors[data.user] = { user: data.user, from: data.from, to: data.to };
    
    socket.to(data.noteId).emit('cursor', {
      user: data.user,
      from: data.from,
      to: data.to,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all notes
    for (const [noteId, users] of Object.entries(noteUsers)) {
      if (users[socket.id]) {
        delete users[socket.id];
        io.to(noteId).emit('users', Object.values(users));
      }
    }
    
    // Remove cursors for this socket
    for (const cursors of Object.values(noteCursors)) {
      for (const [client, _] of Object.entries(cursors)) {
        if (client === socket.id) {
          delete cursors[client];
        }
      }
    }
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO path: /api/socket`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});