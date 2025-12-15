const userSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  oranges: { type: Number, default: 0 },

  orangeUsername: String,   // <--- ADD THIS

  history: [historySchema],

  currentQuiz: {
    lessonId: Number,
    expiresAt: Number,
  },

  lastDaily: Date,

  cooldowns: {
    quiz: Date,
    withdraw: Date,
    read: Date
  }
});
