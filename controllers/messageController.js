const Book = require("../src/models/book");
const Message = require("../src/models/message");

exports.getMessages = async (req, res) => {
  try {
    const { recieverId, bookId } = req.params;
    const book = await Book.findById(bookId);

    if (!book) {
      res.status(404).send("Book not found");
    }
    if (book.cover) {
      book.cover = book.cover.toString("base64");
    }

    // const messages = await Message.find({
    //  receiverId: id , senderId: recieverId
    // })
    //   console.log(messages);
    res.render("message/chat", {
      //   messages,
      path: "/chat",
      pageTitle: "Chat with User",
      owner: req.user,
      product: book,
      recieverId: recieverId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.saveMessage = async ({
  message,
  senderId,
  senderName,
  recieverId,
  createdAt,
}) => {
  try {
    const newMessage = new Message({
      message,
      senderId,
      senderName,
      recieverId,
      createdAt,
    });
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.log(error);
    throw new Error("Error saving message");
  }
};

