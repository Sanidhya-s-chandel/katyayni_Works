const mongoose = require("mongoose");

async function connetDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("connected");
    } catch(e) {
        console.log("Notconnected" + e);
    }
};

connetDB();

module.export = mongoose.connection;