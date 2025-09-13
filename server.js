
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

const app = express();
const port = 3000;



app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));



mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('몽고DB 연결 성공!');
}).catch((err) => {
  console.error('몽고DB 연결 실패:', err);
});


app.use('/auth', authRoutes);
app.use('/api', gameRoutes);


app.get('/', (req, res) => {
  res.send('백엔드 서버가 동작 중입니다!');
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});