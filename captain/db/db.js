const mongoose = require("mongoose")

function connect() {
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("captain db connected successfully")
    }).catch(err=>{
        console.log(err)
    });
}


module.exports =  connect;