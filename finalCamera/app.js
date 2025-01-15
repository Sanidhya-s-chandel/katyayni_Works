const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const onvif = require('onvif');

const app = express();

// Set ffmpeg-static binary path
ffmpeg.setFfmpegPath(ffmpegPath);

// Setup for recordings and views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const recordingsFolder = path.join(__dirname, 'recordings');

// Ensure the recordings folder exists
if (!fs.existsSync(recordingsFolder)) {
  fs.mkdirSync(recordingsFolder);
}

app.use(express.static(path.join(__dirname, 'public')));

let ffmpegProcess = null;

// Function to get RTSP stream URL using ONVIF
const getRtspStreamUrl = (ip, username, password) => {
  return new Promise((resolve, reject) => {
    const camera = new onvif.Cam(
      {
        hostname: ip,
        username: username,
        password: password,
        port: 80, // Default ONVIF port
      },
      function (err) {
        if (err) {
          console.error('ONVIF device initialization failed:', err.message || err);
          reject(`Failed to initialize ONVIF device: ${err.message || err}`);
          return;
        }

        // Get the profiles
        this.getProfiles((err, profiles) => {
          if (err) {
            console.error('Error fetching profiles:', err.message || err);
            reject(`Failed to get profiles: ${err.message || err}`);
            return;
          }

          if (!profiles || profiles.length === 0) {
            console.error('No profiles found for the camera.');
            reject('No profiles found for the camera.');
            return;
          }

          // Use the first profile to get the RTSP stream URI
          const profileToken = profiles[0].$['token'];
          this.getStreamUri({ protocol: 'RTSP', profileToken: profileToken }, (err, stream) => {
            if (err) {
              console.error('Error fetching RTSP stream URI:', err.message || err);
              reject(`Failed to get RTSP stream URI: ${err.message || err}`);
            } else if (!stream || !stream.uri) {
              console.error('Stream URI is missing or undefined.');
              reject('Stream URI is missing or undefined.');
            } else {
              resolve(stream.uri); // RTSP stream URL
            }
          });
        });
      }
    );
  });
};


// Serve the main page
app.get('/', (req, res) => {
  res.render('index');
});

// Start recording route
app.get('/start-recording', async (req, res) => {
  const ip = '49.36.26.249'; // Replace with your camera's IP address
  const username = 'sanidhyasingh@katyayaniorgaincs.com'; // Replace with your camera username
  const password = 'sanidhya123'; // Replace with your camera password

  if (ffmpegProcess) {
    return res.status(400).send('A recording process is already active.');
  }

  try {
    console.log('Attempting to fetch RTSP stream URL...');
    const rtspUrl = await getRtspStreamUrl(ip, username, password);

    if (!rtspUrl) {
      console.error('Failed to retrieve RTSP stream URL.');
      return res.status(400).send('Failed to retrieve RTSP stream URL.');
    }

    console.log(`RTSP URL obtained: ${rtspUrl}`);
    const outputFilePath = path.join(recordingsFolder, `${Date.now()}.mov`);

    ffmpegProcess = ffmpeg()
      .input(rtspUrl)
      .inputOptions(['-rtsp_transport', 'tcp', '-stimeout', '5000000'])
      .videoCodec('libx264')
      .audioCodec('aac')
      .output(outputFilePath)
      .outputOptions(['-preset', 'fast', '-crf', '23', '-movflags', 'faststart'])
      .on('start', (commandLine) => console.log(`Recording started: ${commandLine}`))
      .on('end', () => {
        console.log('Recording finished successfully.');
        ffmpegProcess = null;
      })
      .on('error', (err) => {
        console.error('Error during recording:', err.message);
        ffmpegProcess = null;
      });

    ffmpegProcess.run();
    res.send('Recording started successfully.');
  } catch (err) {
    console.error('Error starting recording:', err);
    res.status(500).send(`Failed to start recording: ${err.message || err}`);
  }
});



// Stop recording route
app.get('/stop-recording', (req, res) => {
  if (!ffmpegProcess) {
    return res.status(400).send('No active recording to stop.');
  }

  try {
    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Recording stopped successfully.');
        res.send('Recording stopped and saved successfully.');
      } else {
        console.error(`FFmpeg process exited with code ${code}.`);
        res.status(500).send('Recording stopped with errors.');
      }
      ffmpegProcess = null;
    });

    ffmpegProcess.kill('SIGINT');
  } catch (err) {
    console.error('Error while stopping recording:', err.message);
    res.status(500).send('Failed to stop recording.');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});