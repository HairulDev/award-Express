const MessageModel = require("../models/message");


const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await MessageModel.findOne({ _id: id })
    res.status(200).json(
      message
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

const getMessages = async (req, res) => {
  try {
    const message = await MessageModel.find()
    res.status(200).json(
      message
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

const sendMessage = async (value) => {
  try {
    const { body, name, email, image, user_created } = value;
    const newMessage = { body, name, email, image, user_created };
    const message = await MessageModel.create(newMessage);
    return message
  } catch (error) {
    return error
  }
};

const updateMessage = async (value) => {
  try {
    const { id, body, name, email, image, user_created } = value;
    console.log("value updatedMessage control", value);
    const message = await MessageModel.findOne({ _id: id })
    message.body = body;
    message.name = name;
    message.email = email;
    message.description = image;
    message.user_created = user_created;
    await message.save();
    return message
  } catch (error) {
    return error
  }
};

const delMessage = async (id) => {
  try {
    const message = await MessageModel.findOne({ _id: id }).populate("imageId");
    await message.remove();
    return message
  } catch (error) {
    return error
  }
};

module.exports = {
  getMessage,
  getMessages,
  sendMessage,
  updateMessage,
  delMessage,
};