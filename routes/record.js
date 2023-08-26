//routes/record.js

const express = require('express');
const router = express.Router();

router.post('/start', (req, res) => {
    // ... Logic to start recording ...
});

// Route to stop recording
router.post('/stop', (req, res) => {
    // ... Logic to stop recording ...
});

module.exports = router;