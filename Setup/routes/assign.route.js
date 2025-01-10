const express = require('express');
const router = express.Router();
const cameraModel = require('../models/camera.model');
// const userModel = require('../models/user.model'); // Assuming this is the User model

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Render the assignment form
router.get('/', (req, res) => {
  res.render('assign');
});

// Handle camera assignment
router.post("/", async (req, res) => {
  try {
    const { userName, cameraName } = req.body;

    // Validate input
    if (!cameraName || !userName) {
      return res.status(400).json({ message: "Camera Name and User Name are required." });
    }

    // Find the camera and user
    const camera = await cameraModel.findOne({ name: cameraName });
    const user = await userModel.findOne({ username: userName }); // Assuming User schema has 'userName'

    if (!camera || !user) {
      return res.status(400).send("Camera or User not found");
    }

    // Update the previous active user's `usedTill` field
    await cameraModel.findOneAndUpdate(
      { cameraId: camera.cameraId, "users.usedTill": null }, // Find the active user (usedTill is null)
      { $set: { "users.$.usedTill": new Date() } } // Set the `usedTill` timestamp
    );

    // Add the new user assignment object
    const newUserAssignment = {
      userId: user.userId, // Assuming User schema has 'userId'
      usedFrom: new Date(),
      usedTill: null, // Placeholder for 'usedTill', indicating this user is active
    };

    // Push the new assignment to the users array
    const updatedCamera = await cameraModel.findOneAndUpdate(
      { cameraId: camera.cameraId },
      { $push: { users: newUserAssignment } },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "User assigned to the camera successfully.",
      updatedCamera,
    });

  } catch (e) {
    console.error("Cannot assign camera to user: " + e);
    res.status(500).json({ message: "An error occurred while assigning the camera." });
  }
});

module.exports = router;