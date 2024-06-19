const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel").default;
const User = require("../models/userModel").default;

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    try {
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        if (isChat.length > 0) {
            res.status(200).json(isChat[0]);
        } else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id })
                .populate("users", "-password");

            res.status(200).json(fullChat);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
    try {
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
    const { users, name } = req.body;

    if (!users || !name) {
        return res.status(400).json({ message: "Please fill all the fields" });
    }

    const userArray = JSON.parse(users);

    if (userArray.length < 2) {
        return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
    }

    userArray.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: name,
            users: userArray,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
        return res.status(400).json({ message: "chatId and chatName are required" });
    }

    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.status(200).json(updatedChat);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        return res.status(400).json({ message: "chatId and userId are required" });
    }

    try {
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.status(200).json(removed);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        return res.status(400).json({ message: "chatId and userId are required" });
    }

    try {
        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.status(200).json(added);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
};
