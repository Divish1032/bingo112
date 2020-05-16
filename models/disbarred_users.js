var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var disbarredUsersSchema = new mongoose.Schema({
        user_id : {
            type : String
        },
        game_id : {
            type : String
        },
        created_at : {
            type : Date,
            default : new Date()
        }
})


disbarredUsersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("DisbarredUsers", disbarredUsersSchema);