
/*
 * composer model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerSchema = new Schema({
    _id: ObjectId,
    uri: String,
    fullname: String,
    categories: [
        { type: ObjectId, ref: 'ComposerCategory'}
    ],
    opuses: [
        { type: ObjectId, ref: 'Opus'}
    ]
});

ComposerSchema.methods = {
    getBirthYear: function () {
        return this.get('birth_year');
    },
    getDeathYear: function () {
        return this.get('death_year');
    },
};

mongoose.model('Composer', ComposerSchema, 'composer');
