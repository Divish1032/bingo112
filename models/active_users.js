var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var activeUsersSchema = new mongoose.Schema({
        user_id : {
            type : String
        },
        created_at : {
            type : Date,
            default : new Date()
        }
})


activeUsersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("ActiveUsers", activeUsersSchema);