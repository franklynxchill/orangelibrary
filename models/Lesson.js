import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  lessonId: Number,
  title: String,
  content: String,
  quiz: {
    question: String,
    options: [String],
    correctAnswer: String
  }
});

export default mongoose.model("Lesson", lessonSchema);
