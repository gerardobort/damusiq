
/*
 * composer model
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ComposerSchema = new Schema({
    id: ObjectId,
    uri: String,
    fullname: String
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
