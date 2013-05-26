
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
        if (this.get('birth')) {
            return new Date(this.get('birth')).getFullYear();
        }
        return null;
    },
    getDeathYear: function () {
        if (this.get('death')) {
            return new Date(this.get('death')).getFullYear();
        }
        return null;
    },
};

mongoose.model('Composer', ComposerSchema, 'composer');
