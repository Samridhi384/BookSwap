const express = require("express");
const socketIo = require("socket.io");

const router = express.Router();
const messageController = require("../../controllers/messageController");
const auth = require("../middlewares/auth");

// router.get("/chat", (req, res) => {
//   const io = socketIo(req.app.get("server"));
//   io.on("connection", messageController.handleMessage(io));

//   res.render("message/chat");
// });

router.get("/chat/:recieverId/:bookId", auth, messageController.getMessages);
router.post("/chats", async (req, res) => {
  const { message, senderId, senderName, recieverId, createdAt } = req.body;
  try {
    const savedMessage = await messageController.saveMessage({
      message,
      senderId,
      senderName,
      recieverId,
      createdAt,
    });
    res.status(200).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving message" });
  }
});

module.exports = router;
