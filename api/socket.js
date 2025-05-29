import { Server } from "socket.io";

// Store for real-time collaboration data (using global for serverless)
if (!global.rooms) {
  global.rooms = new Map();
}

// Generate a random color for user cursors
function generateUserColor() {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#A8E6CF",
    "#FFD93D",
    "#6C5CE7",
    "#00B894",
    "#FDCB6E",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize Socket.IO server only once
let io;

function initializeSocketIO(res) {
  if (!io) {
    console.log('[SOCKET.IO] Initializing Socket.IO server for Vercel...');
    
    io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
      upgradeTimeout: 30000,
      pingTimeout: 25000,
      pingInterval: 10000
    });

    io.on("connection", (socket) => {
      console.log(`[CONNECTION] User connected: ${socket.id} at ${new Date().toISOString()}`);

      // Join a specific note room
      socket.on("join-note", async (data) => {
        try {
          const { noteId, userInfo } = data;

          console.log(`[JOIN REQUEST] User ${socket.id} requesting to join note ${noteId}:`, {
            userInfo,
            timestamp: new Date().toISOString()
          });

          // Leave all other rooms
          Array.from(socket.rooms).forEach((room) => {
            if (room !== socket.id) {
              console.log(`[ROOM LEAVE] User ${socket.id} leaving room ${room}`);
              socket.leave(room);
            }
          });

          // Join the note room
          socket.join(noteId);

          // Initialize room if it doesn't exist
          if (!global.rooms.has(noteId)) {
            global.rooms.set(noteId, {
              noteId,
              users: new Map(),
            });
            console.log(`[ROOM CREATED] New room created for note ${noteId}`);
          }

          const room = global.rooms.get(noteId);
          const userWithColor = {
            id: socket.id,
            email: userInfo?.email || "Anonymous",
            color: generateUserColor(),
            cursor: undefined,
          };

          room.users.set(socket.id, userWithColor);

          console.log(`[JOIN SUCCESS] User ${socket.id} (${userWithColor.email}) joined note ${noteId}:`, {
            userColor: userWithColor.color,
            totalUsersInRoom: room.users.size,
            timestamp: new Date().toISOString()
          });

          // Notify other users in the room about the new user
          socket.to(noteId).emit("user-joined", {
            userId: socket.id,
            user: userWithColor,
          });

          // Send current users to the new user
          const currentUsers = Array.from(room.users.entries()).map(([id, user]) => ({
            userId: id,
            user,
          }));

          socket.emit("current-users", currentUsers);

          console.log(`[USER BROADCAST] Notified ${room.users.size - 1} other users about new user ${socket.id} in note ${noteId}`);
        } catch (error) {
          console.error(`[JOIN ERROR] Error joining note for user ${socket.id}:`, error);
          socket.emit("error", { message: "Failed to join note" });
        }
      });

      // Handle cursor position updates
      socket.on("cursor-update", (data) => {
        const { noteId, position, selection } = data;
        const room = global.rooms.get(noteId);

        if (room?.users.has(socket.id)) {
          const user = room.users.get(socket.id);
          user.cursor = { position, selection };

          console.log(`[CURSOR UPDATE] User ${socket.id} (${user.email}) in note ${noteId}:`, {
            position,
            selection,
            timestamp: new Date().toISOString()
          });

          // Broadcast cursor update to other users in the room
          socket.to(noteId).emit("cursor-moved", {
            userId: socket.id,
            cursor: user.cursor,
            user: {
              id: user.id,
              email: user.email,
              color: user.color,
            },
          });

          console.log(`[CURSOR BROADCAST] Sent cursor update to ${room.users.size - 1} other users in note ${noteId}`);
        } else {
          console.warn(`[CURSOR UPDATE ERROR] User ${socket.id} not found in room ${noteId} or room doesn't exist`);
        }
      });

      // Handle text changes (for conflict resolution)
      socket.on("text-change", (data) => {
        const { noteId, operations, version } = data;
        const room = global.rooms.get(noteId);
        const user = room?.users.get(socket.id);

        console.log(`[TEXT CHANGE] User ${socket.id} (${user?.email || 'Unknown'}) in note ${noteId}:`, {
          operations: operations?.length ? `${operations.length} operations` : 'No operations',
          version,
          timestamp: new Date().toISOString(),
          operationsDetail: operations
        });

        // Broadcast text changes to other users in the room
        socket.to(noteId).emit("text-changed", {
          userId: socket.id,
          operations,
          version,
        });

        const roomUserCount = room?.users.size || 0;
        console.log(`[TEXT BROADCAST] Sent text changes to ${roomUserCount - 1} other users in note ${noteId}`);
      });

      // Handle user selection updates
      socket.on("selection-update", (data) => {
        const { noteId, selection } = data;
        const room = global.rooms.get(noteId);

        if (room?.users.has(socket.id)) {
          const user = room.users.get(socket.id);
          if (user.cursor) {
            user.cursor.selection = selection;
          } else {
            user.cursor = { position: 0, selection };
          }

          console.log(`[SELECTION UPDATE] User ${socket.id} (${user.email}) in note ${noteId}:`, {
            selection,
            timestamp: new Date().toISOString()
          });

          // Broadcast selection update to other users
          socket.to(noteId).emit("selection-changed", {
            userId: socket.id,
            selection,
            user: {
              id: user.id,
              email: user.email,
              color: user.color,
            },
          });

          console.log(`[SELECTION BROADCAST] Sent selection update to ${room.users.size - 1} other users in note ${noteId}`);
        } else {
          console.warn(`[SELECTION UPDATE ERROR] User ${socket.id} not found in room ${noteId} or room doesn't exist`);
        }
      });

      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log(`[DISCONNECT] User disconnected: ${socket.id} at ${new Date().toISOString()}`);

        let disconnectedFromRooms = [];

        // Remove user from all rooms and notify other users
        global.rooms.forEach((room, noteId) => {
          if (room.users.has(socket.id)) {
            const user = room.users.get(socket.id);
            room.users.delete(socket.id);

            disconnectedFromRooms.push({
              noteId,
              userEmail: user.email,
              remainingUsers: room.users.size
            });

            console.log(`[USER REMOVED] User ${socket.id} (${user.email}) removed from note ${noteId}, ${room.users.size} users remaining`);

            // Notify other users about the disconnection
            socket.to(noteId).emit("user-left", {
              userId: socket.id,
            });

            // Clean up empty rooms
            if (room.users.size === 0) {
              global.rooms.delete(noteId);
              console.log(`[ROOM DELETED] Empty room ${noteId} has been cleaned up`);
            }
          }
        });

        if (disconnectedFromRooms.length > 0) {
          console.log(`[DISCONNECT SUMMARY] User ${socket.id} was removed from ${disconnectedFromRooms.length} room(s):`, disconnectedFromRooms);
        } else {
          console.log(`[DISCONNECT SUMMARY] User ${socket.id} was not in any rooms`);
        }
      });
    });

    console.log('[SOCKET.IO] Server initialized successfully');
  }
  return io;
}

export default function handler(req, res) {
  if (req.method === 'GET' && req.url === '/health') {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: 'Vercel Serverless'
    });
    return;
  }

  if (!res.socket.server.io) {
    console.log('[SOCKET.IO] Setting up Socket.IO server...');
    const io = initializeSocketIO(res);
    res.socket.server.io = io;
  }

  res.end();
} 