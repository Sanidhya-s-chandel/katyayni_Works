const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static'); // Get the path to the FFmpeg binary

// Command to list devices
const command = `"${ffmpegPath}" -list_devices true -f dshow -i dummy`;

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error executing FFmpeg:', error);
    return;
  }

  // FFmpeg writes device information to stderr
  const output = stderr.toString();

  console.log('FFmpeg Output:');
  console.log(output);

  // Extract camera names from the output (basic regex-based parsing)
  const cameraNames = [];
  const regex = /"([^"]+)" \(\w+\)/g;
  let match;
  while ((match = regex.exec(output)) !== null) {
    cameraNames.push(match[1]);
  }

  if (cameraNames.length > 0) {
    console.log('Available USB Cameras:');
    cameraNames.forEach((name, index) => {
      console.log(`${index + 1}: ${name}`);
    });
  } else {
    console.log('No USB cameras found.');
  }
});