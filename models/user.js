
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  winStreak: { type: Number, default: 0 },
  rank: { type: Number, default: 18 },
  rankpoint: { type: Number, default: 0 }
});


module.exports = mongoose.model('User', userSchema);