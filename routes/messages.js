var express = require("express");
var router = express.Router();
let mongoose = require("mongoose");
let messageModel = require("../schemas/messages");
let userModel = require("../schemas/users");
let { CheckLogin } = require("../utils/authHandler");

router.get("/", CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let messages = await messageModel.aggregate([
      {
        $match: {
          $or: [
            { from: currentUserId },
            { to: currentUserId }
          ]
        }
      },
      {
        $addFields: {
          partnerId: {
            $cond: [{ $eq: ["$from", currentUserId] }, "$to", "$from"]
          }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$partnerId",
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: {
          newRoot: "$lastMessage"
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    messages = await messageModel.populate(messages, [
      { path: "from", select: "username email fullName avatarUrl" },
      { path: "to", select: "username email fullName avatarUrl" }
    ]);

    res.send(messages);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/:userId", CheckLogin, async function (req, res, next) {
  try {
    let currentUserId = req.user._id;
    let otherUserId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).send({ message: "userId khong hop le" });
    }

    let user = await userModel.findById(otherUserId);
    if (!user) {
      return res.status(404).send({ message: "user khong ton tai" });
    }

    let messages = await messageModel
      .find({
        $or: [
          { from: currentUserId, to: otherUserId },
          { from: otherUserId, to: currentUserId }
        ]
      })
      .populate("from", "username email fullName avatarUrl")
      .populate("to", "username email fullName avatarUrl")
      .sort({ createdAt: 1 });

    res.send(messages);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/", CheckLogin, async function (req, res, next) {
  try {
    let { to, messageContent } = req.body;

    if (!to || !mongoose.Types.ObjectId.isValid(to)) {
      return res.status(400).send({ message: "to khong hop le" });
    }

    if (!messageContent || !messageContent.type || !messageContent.text) {
      return res.status(400).send({ message: "messageContent khong hop le" });
    }

    if (!["file", "text"].includes(messageContent.type)) {
      return res.status(400).send({ message: "type chi duoc la file hoac text" });
    }

    let receiver = await userModel.findById(to);
    if (!receiver) {
      return res.status(404).send({ message: "nguoi nhan khong ton tai" });
    }

    let newMessage = new messageModel({
      from: req.user._id,
      to: to,
      messageContent: {
        type: messageContent.type,
        text: messageContent.text
      }
    });

    newMessage = await newMessage.save();
    newMessage = await newMessage.populate("from", "username email fullName avatarUrl");
    newMessage = await newMessage.populate("to", "username email fullName avatarUrl");

    res.send(newMessage);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
