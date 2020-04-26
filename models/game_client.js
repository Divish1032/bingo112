var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var gameClientSchema = new mongoose.Schema({
		game_id : {
            type : String
        },
        user_id : {
            type : String
        },
        payment : {
            type : Boolean,
            default : false
        },
        created_at : {
            type : Date,
            default : new Date()
        }
})


gameClientSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("GameClient", gameClientSchema);