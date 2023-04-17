const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: String,
    user_created: String
})

module.exports = mongoose.model('Message', messageSchema)