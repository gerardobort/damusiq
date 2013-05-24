
/*
 * composer model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerCategory = require(__dirname + '/composer-category'),
    Opus = require(__dirname + '/opus');

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
        return new Date(this.get('birth')).getFullYear();
    },
    getDeathYear: function () {
        return new Date(this.get('birth')).getFullYear();
    },
};

mongoose.model('Composer', ComposerSchema, 'composer');
