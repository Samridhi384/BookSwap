const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();
require("./src/db/mongoose");
const Book = require("./src/models/book");
const User = require("./src/models/user");
const UserRoutes = require("./src/routes/user");
const BookRoutes = require("./src/routes/book");
const errorController = require("./controllers/error");
const messageController = require("./controllers/messageController");
const messageRoutes = require("./src/routes/socketRoutes");
const session = require("express-session");

const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.set("views", "views");

app.use(messageRoutes);

app.set("server", server);

app.use(bodyparser.json());
app.use(express.json());
app.use(cookieParser());

app.use(UserRoutes);
app.use(BookRoutes);
app.use(errorController.get404Page);

const io = socketIo(server);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New user connected", socket.id);

  //user has joined
  socket.on("joined", (username) => {
    // console.log(username + " has joined");
    socket.broadcast.emit("newUserJoined", username);
  });

  socket.on("leaveChat", (username) => {
    // console.log(username + " has joined");
    socket.broadcast.emit("userLeft", username);
  });

  // Listen for messages
  // socket.on(
  //   "sendMessage",
  //   async ({ message, senderId, senderName, createdAt }) => {
  //     // console.log(moment(createdAt).format(" h:mm a"));
  //     try {
  //       const savedMessage = await messageController.saveMessage(
  //         message,
  //         senderId,
  //         senderName,
  //         createdAt
  //       );
  //       console.log(savedMessage);
  //       io.emit("newMessage", savedMessage);
  //     } catch (error) {
  //       console.log(error);
  //     }

  //     // socket.emit("newMessage", message);
  //     // socket.broadcast.emit("newMessage", message);
  //     // callback();
  //   }
  // );
  socket.on(
    "sendMessage",
    async ({ message, senderId, senderName, recieverId, createdAt }) => {
      try {
        const savedMessage = await messageController.saveMessage({
          message,
          senderId,
          senderName,
          recieverId,
          createdAt,
        });
        io.emit("newMessage", savedMessage);
      } catch (error) {
        console.log(error);
      }
    }
  );

  // Listen for location messages
  socket.on("sendLocation", (coords, createdAt, senderId, senderName) => {
    io.emit(
      "newLocationMessage",
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      createdAt,
      senderId,
      senderName
    );
    console.log(coords);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}`);
});
