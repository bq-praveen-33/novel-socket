# Notion Socket Server

A standalone Socket.IO server for real-time collaboration features, running on port 5050.

## Features

- Real-time collaboration for multiple users
- User cursor tracking and visualization
- Text change synchronization
- User selection updates
- Room-based organization by note ID
- Automatic user color assignment
- Health check endpoint

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Start the server in production mode:
```bash
npm start
```

### Start the server in development mode (with auto-restart):
```bash
npm run dev
```

The server will start on `http://localhost:5050`

## API Endpoints

- **Health Check**: `GET /health` - Returns server status and timestamp
- **Socket.IO**: WebSocket connection available at the root path

## Socket Events

### Client → Server Events

- `join-note`: Join a specific note room
  ```javascript
  socket.emit('join-note', {
    noteId: 'note-123',
    userInfo: { email: 'user@example.com' }
  });
  ```

- `cursor-update`: Update cursor position
  ```javascript
  socket.emit('cursor-update', {
    noteId: 'note-123',
    position: 100,
    selection: { start: 100, end: 110 }
  });
  ```

- `text-change`: Send text changes
  ```javascript
  socket.emit('text-change', {
    noteId: 'note-123',
    operations: [...],
    version: 1
  });
  ```

- `selection-update`: Update text selection
  ```javascript
  socket.emit('selection-update', {
    noteId: 'note-123',
    selection: { start: 0, end: 10 }
  });
  ```

### Server → Client Events

- `user-joined`: New user joined the room
- `current-users`: List of current users in the room
- `cursor-moved`: User cursor position changed
- `text-changed`: Text was modified by another user
- `selection-changed`: User selection changed
- `user-left`: User left the room
- `error`: Error occurred

## Client Connection Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5050');

// Join a note room
socket.emit('join-note', {
  noteId: 'my-note-id',
  userInfo: { email: 'user@example.com' }
});

// Listen for other users' cursor movements
socket.on('cursor-moved', (data) => {
  console.log('User cursor moved:', data);
});

// Listen for text changes
socket.on('text-changed', (data) => {
  console.log('Text changed:', data);
});
```

## Environment Variables

No environment variables are required. The server runs on port 5050 by default.

## Architecture

- **Rooms**: Users are organized into rooms based on note IDs
- **User Management**: Each user gets a unique color and cursor tracking
- **Real-time Sync**: All changes are broadcast to other users in the same room
- **Memory Storage**: Room data is stored in memory (consider Redis for production scaling)

## Production Considerations

- Consider using a process manager like PM2
- Add Redis adapter for scaling across multiple server instances
- Implement authentication and authorization
- Add rate limiting and input validation
- Set up proper logging and monitoring # novel-socket
