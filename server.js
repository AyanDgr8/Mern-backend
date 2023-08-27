//server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // For working with file paths
const multer = require('multer'); // For handling file uploads
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
        console.log('Connected to MongoDB successfully!');
})
.catch((err) => {
    console.error('Connection to MongoDB failed!', err);
});

// Static folder for serving uploaded videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename for the uploaded video
  },
});

const upload = multer({ storage });

// User Model
const User = require('./src/models/user');

// Route for user registration
app.post('/user/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      data: newUser, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for user login
app.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Create a JWT token for the authenticated user
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // You can adjust the expiration time
    );

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for starting and stopping video recording
app.post('/record/start', async (req, res) => {
  try {
    if (isRecording) {
      return res.status(400).json({ message: 'Recording is already in progress' });
    }

    // Access the user's camera and microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

    // Create a new MediaRecorder instance
    mediaRecorder = new MediaRecorder(stream);

    // Event handler for dataavailable event (when recording data is available)
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;

    res.status(200).json({ message: 'Recording started' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to start recording', error: error.message });
  }
});

app.post('/record/stop', upload.single('video'), async (req, res) => {
  try {
    if (!isRecording) {
      return res.status(400).json({ message: 'No active recording to stop' });
    }

    // Stop the MediaRecorder
    mediaRecorder.stop();
    isRecording = false;

    // Create a unique filename for the recorded video
    const filename = `video_${Date.now()}.webm`;

    // Create a write stream to save the recorded video
    const fileStream = fs.createWriteStream(path.join(__dirname, 'uploads', filename));

    // Write the recorded chunks to the video file
    recordedChunks.forEach((chunk) => {
      fileStream.write(chunk);
    });

    // End the file stream
    fileStream.end();

    recordedChunks = []; // Clear recorded chunks

    res.status(200).json({ message: 'Recording stopped and saved', videoFilename: filename });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to stop recording', error: error.message });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
