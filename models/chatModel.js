const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    chatName: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chatAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
