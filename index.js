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
const cookieSession = require('cookie-session');
const passportSetup = require('./config/passport');
const { Server } = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const logger = require('morgan');
connectToMongo();
const app = express();
const port = 5000;
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(logger('dev'));
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2],
  credentials: true
}));

app.use(express.json());
app.use(
  session({
    secret: "lama",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);
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
