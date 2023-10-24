// src/models/login.js

const mongoose = require('mongoose');

const signinSchema = mongoose.Schema({
    email:{type:String,unique:true},
    password:{type:String},
});

const SignInUser = mongoose.model("SignInUser", signinSchema)

module.exports = SignInUser;