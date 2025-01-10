const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const app = express();

// Set ffmpeg-static binary path
ffmpeg.setFfmpegPath(ffmpegPath);

// Set up EJS for the front-end
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const recordingsFolder = path.join(__dirname, 'recordings');

// Ensure the recordings folder exists
if (!fs.existsSync(recordingsFolder)) {
  fs.mkdirSync(recordingsFolder);
}

// Static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Global variable to hold the ffmpeg process
let ffmpegProcess = null;

// Serve the main EJS page
app.get('/', (req, res) => {
  res.render('index');
});

// Start recording route
app.get('/start-recording', (req, res) => {
  if (!ffmpegProcess) {
    const outputFilePath = path.join(__dirname, 'recordings', 'output_video.mkv'); // Output file path

    // viedoDevice will be changed as per the device name and audioDevice will be changed as per the audio device name/ can be added if needed
    const videoDevice = `video=@device_pnp_\\\\?\\usb#vid_174f&pid_14b2&mi_00#7&c827edc&0&0000#{65e8773d-8f56-11d0-a3b9-00a0c9223196}\\global`;

    ffmpegProcess = ffmpeg()
      .input(videoDevice) // Video input
      .inputFormat('dshow') // Input format for Windows
      .videoCodec('libx264') // H.264 codec for video
      .audioCodec('aac') // AAC codec for audio
      .output(outputFilePath) // Output file in the recordings folder
      .outputOptions('-preset fast') // Faster processing
      .on('start', (commandLine) => {
        console.log('Recording started with command:', commandLine);
      })
      .on('end', () => {
        console.log('Recording finished');
        ffmpegProcess = null; // Reset ffmpegProcess
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error during recording:', err);
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
        ffmpegProcess = null; // Reset ffmpegProcess on error
      });

    ffmpegProcess.run();
    res.send('Recording started');
  } else {
    res.send('Recording is already in progress');
  }
});

// Stop recording route
app.get('/stop-recording', (req, res) => {
  if (ffmpegProcess) {
    try {
      ffmpegProcess.kill('SIGINT'); // Stop the ffmpeg process gracefully
      ffmpegProcess = null; // Reset ffmpegProcess
      res.send('Recording stopped');
    } catch (err) {
      console.error('Error stopping recording:', err);
      res.status(500).send('Failed to stop recording');
    }
  } else {
    res.send('No recording is in progress');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});