
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session'); //쿠키 기능 미사용시 삭제
const MongoStore = require('connect-mongo'); //쿠키 기능 미사용시 삭제
require('dotenv').config();


const app = express();
const port = 3000;


app.use(bodyParser.json());


app.use(session({ //쿠키 기능 미사용시 삭제
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






const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 }
});


const User = mongoose.model('User', userSchema);


app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: '회원가입 성공!' });

  } catch (error) {
    // 에러 발생 시 실패 메세지
    res.status(500).send({ message: '회원가입 실패', error: error.message });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });


    if (user && await bcrypt.compare(password, user.password)) {

      req.session.userId = user._id; //쿠키 기능 미사용시 삭제
      req.session.username = user.username; //쿠키 기능 미사용시 삭제

      res.status(200).send({ message: '로그인 성공!', user: user });
    } else {
      res.status(401).send({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
    }
  } catch (error) {
    res.status(500).send({ message: '로그인 실패', error: error.message });
  }
});

app.post('/logout', (req, res) => { //쿠키 기능 미사용시 삭제
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ message: '로그아웃 실패' });
    }
    res.clearCookie('connect.sid'); // 세션 쿠키 삭제
    res.status(200).send({ message: '로그아웃 성공' });
  });
});


app.post('/api/record', async (req, res) => {
  try {
    
    const { userId, result } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: '유저를 찾을 수 없습니다.' });
    }
    if (result === 'win') {
      user.wins += 1; // 승수 +1
      user.winStreak += 1; // 연승 + 1
    } else if (result === 'loss') {
      user.losses += 1; // 패배 수 +1
      user.winStreak = 0; // 패배 시 연승을 0으로 초기화
    } else {
      return res.status(400).send({ message: '잘못된 결과 값입니다.' });
    }
    await user.save();
    res.status(200).send(user);

  } catch (error) {
    res.status(500).send({ message: '전적 업데이트 실패', error: error.message });
  }
});



// 기본 주소
app.get('/', (req, res) => {
  res.send('백엔드 서버가 동작 중입니다!');
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});