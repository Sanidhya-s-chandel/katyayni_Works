const mongoose = require('mongoose');

const cameraConfigSchema = new mongoose.Schema({
  hardwareAddress: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate hardware addresses
    match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, // Matches valid MAC address format
  },
  name: {
    type: String,
    required: true,
    trim: true, // Removes extra spaces
  },
  cameraId: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate IDs
  },
  ipAddress: {
    type: String,
    required: false,
    match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, // Matches valid IPv4 format
  },
  port: {
    type: Number,
    required: false,
    min: 3000,
    max: 65535, // Valid TCP/UDP port range
  },
  users: [
    {
      userId: {
        type: String,
        required: true, // Ensure a user ID is provided
      },
      usedFrom: {
        type: Date,
        required: true, // Start time of the user's session
      },
      usedTill: {
        type: Date
      },
    },
  ],
  recordingStatus: {
     type: Boolean,
      default: false
     },  // Track if camera is recording
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Prevents modification after creation
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updatedAt` on document update
cameraConfigSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const CameraConfig = mongoose.model('CameraConfig', cameraConfigSchema);
module.exports = CameraConfig;