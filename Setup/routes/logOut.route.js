const express = require('express');
const router = express.Router();
const cameraModel = require('../models/camera.model');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get('/', (req, res) => {
    res.render('logOut');
});

router.post("/", async (req, res) => {
    try {
      const cameraName = req.body.cameraName;
      const cameraData = await cameraModel.findOne({ name: cameraName });
  
      // Check if the camera exists
      if (!cameraData) {
        return res.status(400).send("Camera not found");
      }
  
      // Find the active user (where usedTill is null)
      const activeUserIndex = cameraData.users.findIndex(user => user.usedTill === null);
  
      if (activeUserIndex === -1) {
        return res.status(400).send("No active user found for this camera");
      }
  
      // Update the usedTill timestamp for the active user
      cameraData.users[activeUserIndex].usedTill = new Date();
  
      // Save the updated camera data
      await cameraData.save();
  
      // Redirect to the home page ("/") after success
      res.redirect('/');
  
    } catch (e) {
      console.log("Error occurred while updating 'usedTill': ", e);
      res.status(500).send("Internal Server Error");
    }
});


module.exports = router;