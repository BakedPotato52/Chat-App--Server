const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    chatName: { type: String, required: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
