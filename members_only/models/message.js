const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title: {type: String, required: true, maxLength: 100},
    time_stamp: {type: Date, required: true},
    text: {type: String, required: true, maxLength: 1000},
    sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
});



module.exports = mongoose.model('Message', MessageSchema);