const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema.virtual("name").get(function () {
    let fullname = "";
    if (this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }

    return fullname;
});

AuthorSchema.virtual("url").get(function () {
    return `/catalog/author/${this._id}`;
});


AuthorSchema.virtual("lifespan").get(function () {
    let lifetime_string = "";
    if (this.date_of_birth) {
        lifetime_string = DateTime.fromJSDate(this.date_of_birth).toFormat("MMM dd, yyyy");
    }
    lifetime_string += " - ";
    if (this.date_of_death) {
        lifetime_string += DateTime.fromJSDate(this.date_of_death).toFormat("MMM dd, yyyy");
    }

    return lifetime_string;
});

AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
    return DateTime.fromJSDate(this.date_of_birth).toFormat("yyyy-MM-dd");
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
    return DateTime.fromJSDate(this.date_of_death).toFormat("yyyy-MM-dd");
});

module.exports = mongoose.model("Author", AuthorSchema);