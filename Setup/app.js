require("dotenv").config();
const express = require("express");
const app = express();
const cameraModel = require("./models/camera.model");
const setUp = require("./routes/setup.route");
const assign = require("./routes/assign.route");
const logOut = require("./routes/logOut.route");

require("./config/db.config");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/setup-camera",setUp);
app.use("/assign-camera",assign);
app.use("/logOut-camera",logOut);

app.get("/",(req,res)=>{
    res.render("index");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});