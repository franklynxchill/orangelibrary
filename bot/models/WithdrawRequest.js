import mongoose from "mongoose";

const withdrawRequestSchema = new mongoose.Schema({
  userId: String,
  discordId: String,
  username: String,

  amount: Number,
  orangeUsername: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

export default mongoose.model("WithdrawRequest", withdrawRequestSchema);
