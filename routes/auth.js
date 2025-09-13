
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const router = express.Router();


router.post('/auth/register', async (req, res) => {

    try {
        const { username, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ message: '회원가입 성공!' });
    } catch (error) {
        res.status(500).send({ message: '회원가입 실패', error: error.message });
    }
});


router.post('/auth/login', async (req, res) => {

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.username = user.username;
            res.status(200).send({ message: '로그인 성공!', user: user });
        } else {
            res.status(401).send({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
        }
    } catch (error) {
        res.status(500).send({ message: '로그인 실패', error: error.message });
    }
});


router.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ message: '로그아웃 실패' });
    }
    res.clearCookie('connect.sid');
    res.status(200).send({ message: '로그아웃 성공' });
  });
});

module.exports = router;