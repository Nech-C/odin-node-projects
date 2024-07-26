const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name: {type: String, required: true, maxLength: 100},
    email: {type: String, required: true, maxLength: 100},
    is_member: {type: Boolean, required: true},
    is_admin: {type: Boolean, required: true},
    password: {type: String, required: true, maxLength: 100},
    message_list: [{type: Schema.Types.ObjectId, ref: 'Message'}]
});


//Export model
module.exports = mongoose.model('User', UserSchema);