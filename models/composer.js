
/*
 * composer model
 */

var mongoose = require('mongoose'),
    mongooseTextSearch = require('mongoose-text-search'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerSchema = mongoose.Schema({
    _id: ObjectId,
    uri: String,
    fullname: String,
    categories: [
        { type: ObjectId, ref: 'ComposerCategory'}
    ],
    opuses: [
        { type: ObjectId, ref: 'Opus'}
    ],
    periods: [
        { type: ObjectId, ref: 'Period' }
    ]
});

ComposerSchema.plugin(mongooseTextSearch);

ComposerSchema.methods = {
    getBirthYear: function () {
        return this.get('birth_year');
    },
    getDeathYear: function () {
        return this.get('death_year');
    },
};

mongoose.model('Composer', ComposerSchema, 'composer');
