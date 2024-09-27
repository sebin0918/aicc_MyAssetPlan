const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis').default;
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

const myAssetPlanerRoutes = require('./src/routes/myAssetPlanerRoutes');
const registerRoutes = require('./src/routes/RegisterRoutes');
const myPagePasswordRoutes = require('./src/routes/myPagePasswordRoutes');
const myPageRoutes = require('./src/routes/myPageRoutes');
const stockChart = require("./src/routes/stockChartRoutes");
const authRoutes = require('./src/routes/authRoutes');
const HouseHold = require('./src/routes/HouseHoldRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const chatbot = require('./src/routes/chatbotRoutes');
const newscheck = require('./src/routes/newsCheckRoutes');
const stockPredictRoutes = require('./src/routes/stockPredictRoutes');
const componentsRoutes = require('./src/routes/componentsRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const pubClient = redisClient;
const subClient = redisClient.duplicate();

redisClient.on('connect', () => {
  console.log('Redis 클라이언트가 연결되었습니다.');
});

redisClient.on('error', (err) => {
  console.error('Redis 클라이언트 연결 오류:', err);
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_TIMEOUT, 10) || 3600000,
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  },
}));

// Routes 설정
app.use('/api/my-asset-planer', myAssetPlanerRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/myPagePassword', myPagePasswordRoutes);
app.use('/api/mypage', myPageRoutes);
app.use('/api/stock-chart', stockChart);
app.use('/api/auth', authRoutes);
app.use('/api/household', HouseHold);
app.use('/api/admin', adminRoutes);
app.use('/api/chat-bot', chatbot);
app.use('/api/news-check', newscheck);
app.use('/api/stock-predict', stockPredictRoutes);
app.use('/api/components', componentsRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 접속자 관리 변수
let anonymousCounter = 0; // 익명 번호 관리
let onlineUsers = new Set(); // 현재 접속자 세션 관리

subClient.subscribe('newsTalk', (err) => {
  if (err) {
    console.error('Redis 구독 중 오류:', err);
  } else {
    console.log('Redis Pub/Sub 채널 newsTalk에 구독되었습니다.');
  }
});

subClient.on('message', (channel, message) => {
  if (channel === 'newsTalk') {
    try {
      const messageData = JSON.parse(message);
      io.emit('receiveMessage', messageData);
    } catch (e) {
      console.error('메시지 파싱 오류:', e);
    }
  }
});

// Socket.IO 연결 관리
io.on('connection', (socket) => {
  const sessionId = socket.handshake.sessionID;

  // 접속 시 랜덤 익명 번호 부여
  if (!onlineUsers.has(sessionId)) {
    const assignedNumber = ++anonymousCounter; // 카운터 증가
    onlineUsers.add(sessionId);
    console.log(`User ${sessionId} assigned anonymous number: ${assignedNumber}`);
    
    // 현재 접속자 수 출력
    console.log(`Current online users count: ${onlineUsers.size}`);

    socket.emit('assignNumber', assignedNumber); // 클라이언트에 번호 전달
  } else {
    // 기존 사용자일 경우 현재 익명 번호 재전송
    socket.emit('assignNumber', Array.from(onlineUsers).indexOf(sessionId) + 1);
  }

  // 익명 번호 재부여 이벤트
  socket.on('reassignNumbers', () => {
    const currentUsers = Array.from(onlineUsers); // 현재 접속자 목록
    currentUsers.forEach((userSessionId, index) => {
      const newAnonymousNumber = index + 1; // 1부터 시작하는 번호
      console.log(`User ${userSessionId} assigned new anonymous number: ${newAnonymousNumber}`);
      io.to(userSessionId).emit('assignNumber', newAnonymousNumber); // 클라이언트에 새로운 익명 번호 전송
    });
  });

  socket.on('sendMessage', (data) => {
    const timestamp = Date.now();
    const messageData = {
      userId: data.userId,
      anonymousId: data.anonymousId,
      message: data.message,
      timestamp: timestamp,
      time: new Date(timestamp).toLocaleTimeString(),
    };

    pubClient.publish('newsTalk', JSON.stringify(messageData), (err) => {
      if (err) {
        console.error('Redis에 메시지 발행 중 오류:', err);
      }
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(sessionId);
    console.log(`User ${sessionId} disconnected. Current online users: ${onlineUsers.size}`);
  });
});

// 사용자 정보 제공 API
app.get('/api/user', (req, res) => {
  if (req.session && req.session.userId) {
    // 세션에서 사용자 정보 제공
    res.json({
      userId: req.session.userId,
      email: req.session.email,
      username: req.session.username,
    });
  } else {
    res.status(401).json({ error: 'User not logged in' });
  }
});

// 서버 오류 핸들링
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
