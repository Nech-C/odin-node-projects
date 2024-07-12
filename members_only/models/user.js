const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    last_name: {type: String, required: true, maxLength: 100},
    email: {type: String, required: true, maxLength: 100},
    is_member: {type: Boolean, required: true},
    is_admin: {type: Boolean, required: true},
    password: {type: String, required: true, maxLength: 100},
    message_list: [{type: Schema.Types.ObjectId, ref: 'Message'}]
});

// Virtual for user's full name
UserSchema.virtual('name').get( function() {
    return this.first_name + ' ' + this.last_name;
} );


//Export model
module.exports = mongoose.model('User', UserSchema);