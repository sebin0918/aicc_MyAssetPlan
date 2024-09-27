// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// const redis = require('redis');
// const cors = require('cors');

// // Redis 클라이언트 생성
// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error: ', err);
// });

// // Express 앱 생성
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000',  // 클라이언트 도메인
//     methods: ['GET', 'POST'],
//     credentials: true,
//     transports: ['websocket']  // 웹소켓 사용
//   }
// });

// // CORS 설정
// app.use(cors({
//   origin: process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000',
//   credentials: true
// }));



// // 세션 설정
// app.use(session({
//   store: new RedisStore({ client: redisClient }),
//   secret: process.env.SESSION_SECRET || 'defaultSecret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.SESSION_COOKIE_SECURE === 'true',
//     maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600000
//   }
// }));

// // 기본 경로 처리
// app.get('/', (req, res) => {
//   res.send('Server is running!');
// });

// // Socket.io 연결 처리
// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   // 사용자 이름 저장
//   socket.on('join', (username) => {
//     socket.username = username;
//     console.log(`${username} has joined the chat`);
//     socket.broadcast.emit('message', `${username} has joined the chat`);
//   });

//   // 클라이언트가 메시지를 보낼 때 처리
//   socket.on('sendMessage', (message) => {
//     console.log('Message received from client:', message);

//     const time = new Date().toLocaleTimeString();
//     const fullMessage = `${socket.username}: ${message} (${time})`;

//     // Redis에 메시지를 저장
//     redisClient.rpush('messages', fullMessage, (err, reply) => {
//       if (err) {
//         console.error('Redis error:', err);
//       } else {
//         console.log('Message saved to Redis:', fullMessage);
//       }
//     });

//     // 모든 클라이언트에게 메시지 전송
//     io.emit('message', fullMessage);
//   });

//   // 이전 메시지 불러오기
//   redisClient.lrange('messages', 0, -1, (err, messages) => {
//     if (err) {
//       console.error('Redis error:', err);
//     } else if (messages.length > 0) {
//       messages.forEach((msg) => {
//         socket.emit('message', msg);
//       });
//     }
//   });

//   // 클라이언트 연결 해제 처리
//   socket.on('disconnect', () => {
//     console.log(`${socket.username} has left the chat`);
//     socket.broadcast.emit('message', `${socket.username} has left the chat`);
//   });
// });

// // 서버 실행
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



