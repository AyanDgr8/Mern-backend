//src/routes/record.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fluentffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

const storage = multer.memoryStorage(); // Use memory storage for multer

const upload = multer({ storage: storage });

// Initialize an empty array to store video chunks
let videoChunks = [];

// Route to start recording
router.post('/start', (req, res) => {
    // Reset the videoChunks array
    videoChunks = [];

    // Respond with a success message
    res.status(200).json({ message: 'Recording started' });
});

// Route to stop recording and save the recorded video
router.post('/stop', upload.single('video'), async (req, res) => {
    try {
        if (!req.file || !videoChunks.length) {
            return res.status(400).json({ message: 'No video data received' });
        }

        // Concatenate video chunks into a buffer
        const videoBuffer = Buffer.concat(videoChunks);

        // Define the path to save the video
        const videoPath = path.join(__dirname, '../uploads', 'recorded-video.mp4');

        // Write the video buffer to a file
        await writeFileAsync(videoPath, videoBuffer);

        // Convert the video to a desired format (e.g., mp4) using fluent-ffmpeg
        fluentffmpeg(videoPath)
            .outputOptions('-c:v libx264')
            .outputOptions('-c:a aac')
            .save(path.join(__dirname, '../uploads', 'final-video.mp4'))
            .on('end', () => {
                console.log('Video saved and converted');
            });

        // Respond with a success message
        res.status(200).json({ message: 'Recording stopped and saved' });
    } catch (error) {
        console.error('Error saving video:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to retrieve the saved video
router.get('/video', (req, res) => {
    const videoPath = path.join(__dirname, '../uploads', 'final-video.mp4');

    res.sendFile(videoPath);
});

module.exports = router;
