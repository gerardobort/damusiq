
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

mongoose.model('Composer', ComposerSchema, 'composer');
