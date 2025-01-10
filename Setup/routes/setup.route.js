const express = require('express');
const router = express.Router();
const cameraModel = require('../models/camera.model');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.render('setup');
});

router.post("/",async (req,res)=>{
    const {hardwareAddress,name,cameraId,ipAddress,port} = req.body;

    try{
        const camera = await cameraModel.create({
            hardwareAddress,
            name,
            cameraId,
            ipAddress,
            port
        });
    
        console.log(camera);
        res.redirect("/");
    }catch(e){
        console.log("failed to create Camera Config" + e);
        res.redirect("/setup-camera");
    }
});

module.exports = router;