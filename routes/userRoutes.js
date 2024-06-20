const express = require("express");
const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.route("/").post(registerUser).get(protect, allUsers);
userRouter.post("/login", authUser);

module.exports = userRouter;
