// src/models/register.js
const mongoose = require("mongoose");

const registerSchema = mongoose.Schema({
    name:{type:String,},
    email:{type:String,unique:true},
    password:{type:String,}
});

const RegisterUser = mongoose.model('RegisterUser',registerSchema);
module.exports = RegisterUser;