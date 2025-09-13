
const express = require('express');
const User = require('../models/user');
const router = express.Router();


router.post('/record', async (req, res) => {

    try {
        const { userId, result } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: '유저를 찾을 수 없습니다.' });
        }
        if (result === 'win') {
            user.wins += 1;
            user.winStreak += 1;

            if (user.rankpoint < 3) {
                user.rankpoint += 1;
            }

            if (user.rankpoint >= 3 && user.rank > 1) {
                user.rank -= 1;
                user.rankpoint = 0;
            }


        } else if (result === 'loss') {
            user.losses += 1;
            user.winStreak = 0;

            if (user.rankpoint > -3) {
                user.rankpoint -= 1;
            }

            if (user.rankpoint <= -3 && user.rank < 18) {
                user.rank += 1;
                user.rankpoint = 0;
            }


        } else {
            return res.status(400).send({ message: '잘못된 결과 값입니다.' });
        }
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: '전적 업데이트 실패', error: error.message });
    }
});

module.exports = router;