const dotenv = require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectToMongo = require('./database/db');
const auth = require('./routes/AuthRoute');
const post = require('./routes/PostRoute');
const user = require('./routes/UserRoute');
const bookMark = require('./routes/BookMarkRoute');
const message = require('./routes/MessageRoute');
const conversation = require('./routes/ConversationRoute');
const passport = require('passport');
const { Server } = require('socket.io');
const session = require('express-session');
const checkOrigin = require('./middleware/ApiAuth');

connectToMongo();
const app = express();
const port = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());
// app.use(checkOrigin)
const fileStoreOptions = {
  path: './sessions', 
  ttl: 86400, 
};
const sessionMiddleware = session({
  secret: 'saurabh',
  resave: false,
  saveUninitialized: false,
  store: new (require('session-file-store')(session))(fileStoreOptions),
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/post', post);
app.use('/api/bookmark', bookMark);
app.use('/api/conversation', conversation);
app.use('/api/message', message);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});
// socket-io for real time chat
const connectedUsers = {};
const addUser = (userId, socketId) => {
  connectedUsers[userId] = socketId;
};

const removeUser = (socketId) => {
  for (const [userId, userSocketId] of Object.entries(connectedUsers)) {
    if (userSocketId === socketId) {
      delete connectedUsers[userId];
      break;
    }
  }
};

const getUserSocket = (userId) => {
  return connectedUsers[userId];
};

const handleUserConnection = (socket) => {
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);

    io.emit('getUsers', Object.keys(connectedUsers));
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.emit('getUsers', Object.keys(connectedUsers));
  });

  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const receiverSocketId = getUserSocket(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  socket.on('userTyping', ({ senderId, isTyping }) => {
    socket.broadcast.emit('userTyping', { senderId, isTyping });
  });

};
io.on('connection', handleUserConnection);


server.listen(port, () => {
  console.log(`Snapia backend listening at http://localhost:${port}`);
});
