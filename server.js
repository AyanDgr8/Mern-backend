//server.js

const Express = require("express")
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
require("dotenv").config();

const cors = require("cors");

const User = require("./models/user");

const app = Express();

// Middleware
app.use(cors());
app.use(bodyparser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
.then((response) => {
    console.log("Connected to mongo DB successfully!");
})
.catch( err => {
    console.log("Connection to DB failed!", err);
})



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});