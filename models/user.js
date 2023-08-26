//models/user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    webcamPermission: { type: Boolean, default: false },
    audioPermission: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
